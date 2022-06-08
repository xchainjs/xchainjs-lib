import { PoolDetail } from '@xchainjs/xchain-midgard/lib'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import {
  Asset,
  AssetAmount,
  BaseAmount,
  assetAmount,
  assetFromString,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

const BN_1 = new BigNumber(1)

export class LiquidityPool {
  private pool: PoolDetail
  readonly assetBalance: BaseAmount
  readonly runeBalance: BaseAmount

  private _asset: Asset
  private _assetString: string
  private _currentPriceInRune: AssetAmount
  private _currentPriceInAsset: AssetAmount

  constructor(pool: PoolDetail) {
    this.pool = pool
    const asset = assetFromString(this.pool.asset)
    if (!asset) throw new Error(`could not parse ${this.pool.asset}`)

    this._asset = asset
    this._assetString = this.pool.asset

    this.assetBalance = baseAmount(this.pool.assetDepth)
    this.runeBalance = baseAmount(this.pool.runeDepth) //Rune is always 8 decimals

    const runeToAssetRatio = this.runeBalance.div(this.assetBalance)
    this._currentPriceInRune = baseToAsset(runeToAssetRatio)
    this._currentPriceInAsset = assetAmount(BN_1.dividedBy(runeToAssetRatio.amount()))
  }
  isAvailable(): boolean {
    return this.pool.status.toLowerCase() === 'available'
  }
  getPriceIn(otherAssetPool: LiquidityPool): AssetAmount {
    return otherAssetPool.currentPriceInAsset.times(this.currentPriceInRune)
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
  /**
   * Returns the rune value.
   * If the asset passed in is NativeRune, assetAmount is returned back
   * If the asset passed in does not match the pool's asset, thow an error, else convert assetAmount into rune value.
   *
   * @param asset asset type. Should match the asset of the pool
   * @param assetAmount - the amount of asset in the value of RUNE
   * @returns
   */
  public getValueInRUNE(asset: Asset, assetAmount: BaseAmount): BaseAmount {
    if (isAssetRuneNative(asset)) {
      return assetAmount
    }
    if (asset.ticker != this._asset.ticker) {
      throw new Error(`wrong asset for the pool`)
    }
    return assetAmount.times(this.runeBalance.div(this.assetBalance))
  }
}
