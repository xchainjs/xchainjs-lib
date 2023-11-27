import { Network } from '@xchainjs/xchain-client'
import { abi } from '@xchainjs/xchain-evm'
import { MAYAChain } from '@xchainjs/xchain-mayachain'
import { MayachainQuery, QuoteSwap, QuoteSwapParams } from '@xchainjs/xchain-mayachain-query'
import { CryptoAmount, baseAmount, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { TxSubmitted } from './types'
import { Wallet } from './wallet'

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class MayachainAMM {
  private mayachainQuery: MayachainQuery
  private wallet: Wallet

  /**
   * Constructor to create a MayachainAMM
   *
   * @param mayachainQuery - an instance of the MayachainQuery
   * @returns MayachainAMM
   */
  constructor(mayachainQuery = new MayachainQuery(), wallet = new Wallet('', Network.Mainnet)) {
    this.mayachainQuery = mayachainQuery
    this.wallet = wallet
  }

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
    })

    if (errors.length > 0) {
      return {
        toAddress: ``,
        memo: ``,
        expectedAmount: new CryptoAmount(baseAmount(0), destinationAsset),
        dustThreshold: this.mayachainQuery.getChainDustValue(fromAsset.chain),
        fees: {
          asset: destinationAsset,
          affiliateFee: new CryptoAmount(baseAmount(0), fromAsset),
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

    // check address
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
      errors.push(`affiliateBps ${affiliateAddress} out of range [0 - 10000]`)
    }
    if (this.wallet.isERC20Asset(fromAsset) && fromAddress) {
      const inboundDetails = await this.mayachainQuery.getChainInboundDetails(fromAsset.chain)
      if (!inboundDetails.router) throw Error(`Unknown router address for ${fromAsset.chain}`)

      const contractAddress = getContractAddressFromAsset(fromAsset)

      const isApprovedResult = await this.wallet.isAllowedToSpend(
        fromAsset,
        amount.baseAmount,
        fromAddress,
        contractAddress,
      )
      if (!isApprovedResult) errors.push('Maya router router has not been approved to spend this amount')
    }

    return errors
  }

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

  private async isMAYAName(name: string): Promise<boolean> {
    return !!(await this.mayachainQuery.getMAYANameDetails(name))
  }

  private async doProtocolAssetSwap(amount: CryptoAmount, memo: string): Promise<TxSubmitted> {
    const hash = await this.wallet.deposit({ asset: amount.asset, amount: amount.baseAmount, memo })

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(amount.asset.chain, hash),
    }
  }

  private async doNonProtocolAssetSwap(amount: CryptoAmount, recipient: string, memo: string): Promise<TxSubmitted> {
    // Non ERC20 swaps
    if (!this.wallet.isERC20Asset(amount.asset)) {
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

    const expiry = new Date(new Date().getTime() + 15 * 60000).getMilliseconds() / 1000
    const depositParams = [recipient, checkSummedContractAddress, amount.baseAmount.amount().toFixed(), memo, expiry]

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
}
