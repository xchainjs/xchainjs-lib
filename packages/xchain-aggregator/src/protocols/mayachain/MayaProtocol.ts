import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { Asset, assetFromStringEx, eqAsset } from '@xchainjs/xchain-util'

import { IProtocol, QuoteSwap, QuoteSwapParams } from '../../types'

export class MayaProtocol implements IProtocol {
  public readonly name = 'Mayachain'
  private mayachainQuery: MayachainQuery
  private mayachainAmm: MayachainAMM
  constructor() {
    this.mayachainQuery = new MayachainQuery()
    this.mayachainAmm = new MayachainAMM(this.mayachainQuery)
  }

  public async isAssetSupported(asset: Asset): Promise<boolean> {
    const pools = await this.mayachainQuery.getPools()
    return (
      pools.findIndex((pool) => pool.status === 'Available' && eqAsset(asset, assetFromStringEx(pool.asset))) !== -1
    )
  }

  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const estimatedSwap = await this.mayachainAmm.estimateSwap(params)
    return {
      protocol: this.name,
      toAddress: estimatedSwap.toAddress,
      memo: estimatedSwap.memo,
      expectedAmount: estimatedSwap.expectedAmount,
      dustThreshold: estimatedSwap.dustThreshold,
      fees: estimatedSwap.fees,
      totalSwapSeconds: estimatedSwap.inboundConfirmationSeconds || 0 + estimatedSwap.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.slipBasisPoints,
      canSwap: estimatedSwap.canSwap,
      errors: estimatedSwap.errors,
      warning: estimatedSwap.warning,
    }
  }
}
