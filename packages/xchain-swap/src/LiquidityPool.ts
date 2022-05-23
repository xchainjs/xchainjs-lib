import { PoolDetail } from '@xchainjs/xchain-midgard/lib/generated/midgardApi'
import {
  Asset,
  AssetAmount,
  BaseAmount,
  assetAmount,
  assetFromString,
  baseAmount,
  //   baseToAsset,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

const BN_1 = new BigNumber(1)

export class LiquidityPool {
  private pool: PoolDetail
  private assetBaseAmount: BaseAmount
  private runeBaseAmount: BaseAmount

  private _asset: Asset
  private _assetString: string
  private _currentPriceInRune: AssetAmount
  private _currentPriceInAsset: AssetAmount

  constructor(pool: PoolDetail) {
    this.pool = pool
    // console.log(this.pool.asset)
    const asset = assetFromString(this.pool.asset)
    if (!asset) throw new Error(`could not parse ${this.pool.asset}`)

    this._asset = asset
    this._assetString = this.pool.asset

    this.assetBaseAmount = baseAmount(this.pool.assetDepth)
    this.runeBaseAmount = baseAmount(this.pool.runeDepth) //Rune is always 8 decimals

    const runeToAssetRatio = this.runeBaseAmount.amount().div(this.assetBaseAmount.amount())
    this._currentPriceInRune = assetAmount(runeToAssetRatio)
    this._currentPriceInAsset = assetAmount(BN_1.dividedBy(runeToAssetRatio))
  }
  isAvailable() {
    return this.pool.status.toLowerCase() === 'available'
  }
  getPriceIn(otherAssetPool: LiquidityPool): AssetAmount {
    const price = otherAssetPool.currentPriceInAsset.amount().multipliedBy(this.currentPriceInRune.amount())
    return assetAmount(price)
  }
  public get currentPriceInAsset(): AssetAmount {
    return this._currentPriceInAsset
  }
  public get currentPriceInRune(): AssetAmount {
    return this._currentPriceInRune
  }
  public get asset(): Asset {
    return this._asset
  }
  public get assetString(): string {
    return this._assetString
  }
}
