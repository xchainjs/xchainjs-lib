import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { Asset, assetFromStringEx, eqAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { IProtocol, QuoteSwap, QuoteSwapParams, TxSubmitted } from '../../types'

export class MayachainProtocol implements IProtocol {
  public readonly name = 'Mayachain' as const
  private mayachainQuery: MayachainQuery
  private mayachainAmm: MayachainAMM

  constructor(wallet?: Wallet) {
    this.mayachainQuery = new MayachainQuery()
    this.mayachainAmm = new MayachainAMM(this.mayachainQuery, wallet)
  }

  public async isAssetSupported(asset: Asset): Promise<boolean> {
    if (eqAsset(asset, AssetCacao)) return true
    const pools = await this.mayachainQuery.getPools()
    return (
      pools.findIndex((pool) => pool.status === 'available' && eqAsset(asset, assetFromStringEx(pool.asset))) !== -1
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

  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    return this.mayachainAmm.doSwap(params)
  }
}
