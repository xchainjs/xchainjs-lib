import { PoolDetail } from '@xchainjs/xchain-midgard/lib'
import { Pool } from '@xchainjs/xchain-mayanode/lib'
import { Asset, BaseAmount, assetFromString, baseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

/**
 * Represent a Liquidity Pool in Mayachain
 */
export class LiquidityPool {
  readonly pool: PoolDetail
  readonly mayanodeDetails: Pool
  readonly assetBalance: BaseAmount
  readonly cacaoBalance: BaseAmount
  // readonly decimals: number

  readonly asset: Asset
  readonly assetString: string
  readonly cacaoToAssetRatio: BigNumber
  readonly assetToCacaoRatio: BigNumber

  constructor(pool: PoolDetail, mayanodeDetails: Pool) {
    this.pool = pool
    this.mayanodeDetails = mayanodeDetails
    const asset = assetFromString(this.pool.asset)
    if (!asset) throw new Error(`could not parse ${this.pool.asset}`)

    this.asset = asset
    // this.decimals = decimals
    this.assetString = this.pool.asset
    this.assetBalance = baseAmount(this.pool.assetDepth)
    this.cacaoBalance = baseAmount(this.pool.runeDepth)

    this.cacaoToAssetRatio = this.cacaoBalance.amount().div(this.assetBalance.amount())
    this.assetToCacaoRatio = this.assetBalance.amount().div(this.cacaoBalance.amount())
  }
  isAvailable(): boolean {
    return this.pool.status.toLowerCase() === 'available'
  }
}
