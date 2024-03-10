import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Asset, assetToString, eqAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { IProtocol, QuoteSwap, QuoteSwapParams, TxSubmitted } from '../../types'

export class ThorchainProtocol implements IProtocol {
  public readonly name = 'Thorchain' as const
  private thorchainQuery: ThorchainQuery
  private thorchainAmm: ThorchainAMM

  constructor(wallet?: Wallet) {
    this.thorchainQuery = new ThorchainQuery()
    this.thorchainAmm = new ThorchainAMM(this.thorchainQuery, wallet)
  }

  /**
   * Check if an asset is supported in the protocol
   * @param {Asset} asset Asset to check if it is supported
   * @returns {boolean} True if the asset is supported, otherwise false
   */
  public async isAssetSupported(asset: Asset): Promise<boolean> {
    if (eqAsset(asset, AssetRuneNative)) return true
    const pools = await this.thorchainQuery.thorchainCache.getPools()
    return (
      Object.values(pools).findIndex((pool) => pool.isAvailable() && assetToString(asset) === pool.assetString) !== -1
    )
  }

  /**
   * Estimate swap by validating the swap parameters.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {QuoteSwap} Quote swap result. If swap cannot be done, it returns an empty QuoteSwap with reasons.
   */
  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const estimatedSwap = await this.thorchainAmm.estimateSwap(params)
    return {
      protocol: this.name,
      toAddress: estimatedSwap.toAddress,
      memo: estimatedSwap.memo,
      expectedAmount: estimatedSwap.txEstimate.netOutput,
      dustThreshold: estimatedSwap.dustThreshold,
      fees: estimatedSwap.txEstimate.totalFees,
      totalSwapSeconds:
        estimatedSwap.txEstimate.inboundConfirmationSeconds || 0 + estimatedSwap.txEstimate.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.txEstimate.slipBasisPoints,
      canSwap: estimatedSwap.txEstimate.canSwap,
      errors: estimatedSwap.txEstimate.errors,
      warning: estimatedSwap.txEstimate.warning,
    }
  }

  /**
   * Perform a swap operation between assets.
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    return this.thorchainAmm.doSwap(params)
  }
}
