import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { MAX_APPROVAL, abi } from '@xchainjs/xchain-evm'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient, MAYAChain } from '@xchainjs/xchain-mayachain'
import { MayachainQuery, QuoteSwap, QuoteSwapParams } from '@xchainjs/xchain-mayachain-query'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { Asset, CryptoAmount, baseAmount, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { ethers } from 'ethers'

import { ApproveParams, IsApprovedParams, TxSubmitted } from './types'

/**
 * MAYAChainAMM class for interacting with THORChain.
 * Recommended main class to use for swapping with MAYAChain
 * Has access to Midgard and MayaNode data
 */
export class MayachainAMM {
  private mayachainQuery: MayachainQuery
  private wallet: Wallet

  /**
   * Constructor to create a MayachainAMM
   * @param mayachainQuery - an instance of the MayachainQuery
   * @returns MayachainAMM
   */
  constructor(
    mayachainQuery = new MayachainQuery(),
    wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, network: Network.Mainnet }),
      ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
      DASH: new DashClient({ ...defaultDashParams, network: Network.Mainnet }),
      KUJI: new KujiraClient({ ...defaultKujiParams, network: Network.Mainnet }),
      THOR: new ThorClient({ network: Network.Mainnet }),
      MAYA: new MayaClient({ network: Network.Mainnet }),
    }),
  ) {
    this.mayachainQuery = mayachainQuery
    this.wallet = wallet
  }

  /**
   * Estimate swap validating the swap params
   * @param {QuoteSwapParams} quoteSwapParams Swap params
   * @returns {QuoteSwap} Quote swap. If swap can not be done, it returns an empty QuoteSwap with the reasons the swap can not be done
   */
  public async estimateSwap({
    fromAsset,
    fromAddress,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress,
    affiliateBps,
    toleranceBps,
  }: QuoteSwapParams): Promise<QuoteSwap> {
    const errors = await this.validateSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
    })

    if (errors.length > 0) {
      return {
        toAddress: ``,
        memo: ``,
        expectedAmount: new CryptoAmount(baseAmount(0), destinationAsset),
        dustThreshold: this.mayachainQuery.getChainDustValue(fromAsset.chain),
        fees: {
          asset: destinationAsset,
          affiliateFee: new CryptoAmount(baseAmount(0), destinationAsset),
          outboundFee: new CryptoAmount(baseAmount(0), destinationAsset),
        },
        outboundDelayBlocks: 0,
        outboundDelaySeconds: 0,
        inboundConfirmationSeconds: 0,
        inboundConfirmationBlocks: 0,
        canSwap: false,
        errors,
        slipBasisPoints: 0,
        totalSwapSeconds: 0,
        warning: '',
      }
    }

    return this.mayachainQuery.quoteSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
    })
  }

  /**
   * Validate swap params
   * @param {QuoteSwapParams} quoteSwapParams Swap params
   * @returns {string[]} the reasons the swap can not be done. If it is empty there are no reason to avoid the swap
   */
  public async validateSwap({
    fromAsset,
    fromAddress,
    destinationAsset,
    destinationAddress,
    amount,
    affiliateAddress,
    affiliateBps,
  }: QuoteSwapParams): Promise<string[]> {
    const errors: string[] = []

    if (destinationAddress && !this.wallet.validateAddress(destinationAsset.chain, destinationAddress)) {
      errors.push(`destinationAddress ${destinationAddress} is not a valid address`)
    }

    if (affiliateAddress) {
      const isMayaAddress = this.wallet.validateAddress(MAYAChain, affiliateAddress)
      const isMayaName = await this.isMAYAName(affiliateAddress)
      if (!(isMayaAddress || isMayaName))
        errors.push(`affiliateAddress ${affiliateAddress} is not a valid MAYA address`)
    }

    if (affiliateBps && (affiliateBps < 0 || affiliateBps > 10000)) {
      errors.push(`affiliateBps ${affiliateBps} out of range [0 - 10000]`)
    }

    if (this.isERC20Asset(fromAsset) && fromAddress) {
      const approveErrors = await this.isRouterApprovedToSpend({
        asset: fromAsset,
        address: fromAddress,
        amount: amount.baseAmount,
      })
      errors.push(...approveErrors)
    }

    return errors
  }

  /**
   * Do swap between assets
   * @param {QuoteSwapParams} quoteSwapParams Swap params
   * @returns {TxSubmitted} the swap transaction hash and url
   */
  public async doSwap({
    fromAsset,
    fromAddress,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress,
    affiliateBps,
    toleranceBps,
  }: QuoteSwapParams): Promise<TxSubmitted> {
    const quoteSwap = await this.estimateSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
    })

    if (!quoteSwap.canSwap) throw Error(`Can not swap. ${quoteSwap.errors.join(' ')}`)

    return fromAsset.chain === MAYAChain || fromAsset.synth
      ? this.doProtocolAssetSwap(amount, quoteSwap.memo)
      : this.doNonProtocolAssetSwap(amount, quoteSwap.toAddress, quoteSwap.memo)
  }

  /**
   * Approve Mayachain router in the chain of the asset to spend the amount in name of the address
   * @param {ApproveParams} approveParams contains the asset and amount the router will be allowed. If amount is not defined,
   * an infinity approve will be done
   */
  public async approveRouterToSpend({ asset, amount }: ApproveParams): Promise<TxSubmitted> {
    const inboundDetails = await this.mayachainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)
    const tx = await this.wallet.approve(
      asset,
      amount || baseAmount(MAX_APPROVAL.toString(), await this.mayachainQuery.getAssetDecimals(asset)),
      inboundDetails.router,
    )

    return {
      hash: tx.hash,
      url: await this.wallet.getExplorerTxUrl(asset.chain, tx.hash),
    }
  }

  /**
   * Validate if the asset router is allowed to spend the asset amount in name of the address
   * @param {IsApprovedParams} isApprovedParams contains the asset and the amount the router is supposed to spend
   * int name of address
   * @returns {string[]} the reasons the router of the asset is not allowed to spend the amount. If it is empty, the asset router is allowed to spend the amount
   */
  public async isRouterApprovedToSpend({ asset, amount, address }: IsApprovedParams): Promise<string[]> {
    const errors: string[] = []

    const inboundDetails = await this.mayachainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)

    const isApprovedResult = await this.wallet.isApproved(asset, amount, address, inboundDetails.router)

    if (!isApprovedResult) errors.push('Maya router has not been approved to spend this amount')

    return errors
  }

  /**
   * Check if a name is a valid MAYAName
   * @param {string} name MAYAName
   * @returns {boolean} true if is a registered MAYAName, otherwise, false
   */
  private async isMAYAName(name: string): Promise<boolean> {
    return !!(await this.mayachainQuery.getMAYANameDetails(name))
  }

  /**
   * Do swap from native protocol asset to any other asset
   * @param {CryptoAmount} amount Amount to swap
   * @param {string} memo Memo to add to the transaction to successfully make the swap
   * @returns {TxSubmitted} the swap transaction hash and url
   */
  private async doProtocolAssetSwap(amount: CryptoAmount, memo: string): Promise<TxSubmitted> {
    const hash = await this.wallet.deposit({ asset: amount.asset, amount: amount.baseAmount, memo })

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(amount.asset.chain, hash),
    }
  }

  /**
   * Do swap between assets
   * @param {CryptoAmount} amount Amount to swap
   * @param {string} memo Memo to add to the transaction to successfully make the swap
   * @param {string} recipient inbound address to make swap transaction to
   * @returns {TxSubmitted} the swap transaction hash and url
   */
  private async doNonProtocolAssetSwap(amount: CryptoAmount, recipient: string, memo: string): Promise<TxSubmitted> {
    // Non ERC20 swaps
    if (!this.isERC20Asset(amount.asset)) {
      const hash = await this.wallet.transfer({
        asset: amount.asset,
        amount: amount.baseAmount,
        recipient,
        memo,
      })
      return {
        hash,
        url: await this.wallet.getExplorerTxUrl(amount.asset.chain, hash),
      }
    }

    // ERC20 swaps
    const inboundDetails = await this.mayachainQuery.getChainInboundDetails(amount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${amount.asset.chain} chain`)
    const contractAddress = getContractAddressFromAsset(amount.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)

    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      recipient,
      checkSummedContractAddress,
      amount.baseAmount.amount().toFixed(),
      memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(amount.asset.chain)

    const gasPrices = await this.wallet.getGasFeeRates(amount.asset.chain)

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: this.wallet.getAddress(amount.asset.chain),
      value: 0,
      gasPrice: gasPrices.fast.amount().toFixed(),
      gasLimit: '160000',
    })

    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(amount.asset.chain, hash),
    }
  }

  /**
   * Check if asset is ERC20
   * @param {Asset} asset to check
   * @returns true if asset is ERC20, otherwise, false
   */
  private isERC20Asset(asset: Asset): boolean {
    return this.isEVMChain(asset.chain) ? [AssetETH.symbol].includes(asset.symbol) : false
  }

  /**
   * Check if asset chain is EVM
   * @param {Chain} chain to check
   * @returns true if chain is EVM, otherwise, false
   */
  private isEVMChain(chain: string): boolean {
    return [AssetETH.chain].includes(chain)
  }
}
