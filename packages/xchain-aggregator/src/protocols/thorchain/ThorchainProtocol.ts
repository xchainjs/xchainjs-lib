import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Asset, assetToString, eqAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { IProtocol, QuoteSwap, QuoteSwapParams } from '../../types'

export class ThorchainProtocol implements IProtocol {
  public readonly name = 'Thorchain'
  private thorchainQuery: ThorchainQuery
  private thorchainAmm: ThorchainAMM

  constructor(wallet?: Wallet) {
    this.thorchainQuery = new ThorchainQuery()
    this.thorchainAmm = new ThorchainAMM(this.thorchainQuery, wallet)
  }

  public async isAssetSupported(asset: Asset): Promise<boolean> {
    if (eqAsset(asset, AssetRuneNative)) return true
    const pools = await this.thorchainQuery.thorchainCache.getPools()
    return (
      Object.values(pools).findIndex((pool) => pool.isAvailable() && assetToString(asset) === pool.assetString) !== -1
    )
  }

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
}
