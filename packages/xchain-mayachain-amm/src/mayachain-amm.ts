/**
 * Import necessary modules and libraries
 */
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { MAX_APPROVAL, abi } from '@xchainjs/xchain-evm'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient, MAYAChain } from '@xchainjs/xchain-mayachain'
import { MayachainQuery, QuoteSwap, QuoteSwapParams } from '@xchainjs/xchain-mayachain-query'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { Asset, CryptoAmount, baseAmount, eqAsset, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { ethers } from 'ethers'

import { ApproveParams, IsApprovedParams, TxSubmitted } from './types'

/**
 * Mayachain Automated Market Maker (AMM) class.
 * MAYAChainAMM class for interacting with THORChain.
 * Recommended main class to use for swapping with MAYAChain
 * Has access to Midgard and MayaNode data
 */
export class MayachainAMM {
  private mayachainQuery: MayachainQuery
  private wallet: Wallet

  /**
   * Constructor to create a MayachainAMM instance.
   *
   * @param {MayachainQuery} mayachainQuery An instance of the MayachainQuery class.
   * @param {Wallet} wallet A wallet instance containing clients for various blockchains.
   * @returns {MayachainAMM} Returns the MayachainAMM instance.
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
   * Estimate swap by validating the swap parameters.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {QuoteSwap} Quote swap result. If swap cannot be done, it returns an empty QuoteSwap with reasons.
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
   * Validate swap parameters before performing a swap operation.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {string[]} Reasons the swap cannot be executed. Empty array if the swap is valid.
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

    // Validate destination address if provided
    if (
      destinationAddress &&
      !this.wallet.validateAddress(destinationAsset.synth ? MAYAChain : destinationAsset.chain, destinationAddress)
    ) {
      errors.push(`destinationAddress ${destinationAddress} is not a valid address`)
    }
    // Validate affiliate address if provided
    if (affiliateAddress) {
      const isMayaAddress = this.wallet.validateAddress(MAYAChain, affiliateAddress)
      const isMayaName = await this.isMAYAName(affiliateAddress)
      if (!(isMayaAddress || isMayaName))
        errors.push(`affiliateAddress ${affiliateAddress} is not a valid MAYA address`)
    }
    // Validate affiliate basis points if provided
    if (affiliateBps && (affiliateBps < 0 || affiliateBps > 10000)) {
      errors.push(`affiliateBps ${affiliateBps} out of range [0 - 10000]`)
    }
    // Validate approval if asset is an ERC20 token and fromAddress is provided
    if (this.isERC20Asset(fromAsset) && fromAddress) {
      const approveErrors = await this.isRouterApprovedToSpend({
        asset: fromAsset,
        address: fromAddress,
        amount,
      })
      errors.push(...approveErrors)
    }

    return errors
  }

  /**
   * Perform a swap operation between assets.
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters
   * @returns {TxSubmitted} Transaction hash and URL of the swap
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
    // Check if the swap can be performed
    if (!quoteSwap.canSwap) throw Error(`Can not swap. ${quoteSwap.errors.join(' ')}`)
    // Perform the swap based on the asset chain
    return fromAsset.chain === MAYAChain || fromAsset.synth
      ? this.doProtocolAssetSwap(amount, quoteSwap.memo)
      : this.doNonProtocolAssetSwap(amount, quoteSwap.toAddress, quoteSwap.memo)
  }

  /**
   * Approve the Mayachain router to spend a certain amount in the asset chain.
   * @param {ApproveParams} approveParams Parameters for approving the router to spend
   * @returns {Promise<TxSubmitted>} Transaction hash and URL
   */
  public async approveRouterToSpend({ asset, amount }: ApproveParams): Promise<TxSubmitted> {
    // Get inbound details for the asset chain
    const inboundDetails = await this.mayachainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)
    // Perform approval
    const tx = await this.wallet.approve(
      asset,
      amount?.baseAmount || baseAmount(MAX_APPROVAL.toString(), await this.mayachainQuery.getAssetDecimals(asset)),
      inboundDetails.router,
    )
    // Return transaction hash and URL
    return {
      hash: tx.hash,
      url: await this.wallet.getExplorerTxUrl(asset.chain, tx.hash),
    }
  }

  /**
   * Validate if the asset router is allowed to spend the asset amount on behalf of the address.
   * @param {IsApprovedParams} isApprovedParams Parameters for checking approval.
   * @returns {string[]} Reasons the asset router is not allowed to spend the amount. Empty array if the router is approved.
   */
  public async isRouterApprovedToSpend({ asset, amount, address }: IsApprovedParams): Promise<string[]> {
    const errors: string[] = []
    // Get inbound details for the asset chain
    const inboundDetails = await this.mayachainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)
    // Check if the router is approved to spend the amount
    const isApprovedResult = await this.wallet.isApproved(asset, amount.baseAmount, address, inboundDetails.router)

    if (!isApprovedResult) errors.push('Maya router has not been approved to spend this amount')

    return errors
  }

  /**
   * Check if a name is a valid MAYAName
   * @param {string} name MAYAName to check
   * @returns {boolean} True if the name is registered as a MAYAName, otherwise false
   */
  private async isMAYAName(name: string): Promise<boolean> {
    return !!(await this.mayachainQuery.getMAYANameDetails(name))
  }

  /**
   * Perform a swap from a native protocol asset to any other asset
   * @param {CryptoAmount} amount Amount to swap
   * @param {string} memo Memo to add to the transaction
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  private async doProtocolAssetSwap(amount: CryptoAmount, memo: string): Promise<TxSubmitted> {
    // Deposit the amount and return transaction hash and URL
    const hash = await this.wallet.deposit({ chain: MAYAChain, asset: amount.asset, amount: amount.baseAmount, memo })

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(MAYAChain, hash),
    }
  }

  /**
   * Perform a swap between assets
   * @param {CryptoAmount} amount Amount to swap
   * @param {string} memo Memo to add to the transaction to successfully make the swap
   * @param {string} recipient inbound address to make swap transaction to
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  private async doNonProtocolAssetSwap(amount: CryptoAmount, recipient: string, memo: string): Promise<TxSubmitted> {
    // For non-ERC20 assets, perform a transfer and return transaction hash and URL
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

    // For ERC20 assets, perform a deposit with expiry and return transaction hash and URL
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
   * Check if the asset is an ERC20 token
   * @param {Asset} asset Asset to check
   * @returns True if the asset is an ERC20 token, otherwise false
   */
  private isERC20Asset(asset: Asset): boolean {
    // Check if the asset's chain is an EVM chain and if the symbol matches AssetETH.symbol
    return this.isEVMChain(asset.chain)
      ? [AssetETH].findIndex((nativeEVMAsset) => eqAsset(nativeEVMAsset, asset)) === -1 && !asset.synth
      : false
  }

  /**
   * Check if the chain is an EVM (Ethereum Virtual Machine) chain
   * @param {Chain} chain Chain to check
   * @returns True if the chain is an EVM chain, otherwise false
   */
  private isEVMChain(chain: string): boolean {
    // Check if the chain matches AssetETH.chain
    return [AssetETH.chain].includes(chain)
  }
}
