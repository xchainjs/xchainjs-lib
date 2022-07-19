import { PoolDetail } from '@xchainjs/xchain-midgard/lib'
import {
  Asset,
  // AssetAmount,
  // AssetRuneNative,
  BaseAmount,
  // assetAmount,
  assetFromString,
  // assetToBase,
  // assetToString,
  baseAmount,
  // eqAsset,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

// import { CryptoAmount } from './crypto-amount'

export class LiquidityPool {
  private pool: PoolDetail
  readonly assetBalance: BaseAmount
  readonly runeBalance: BaseAmount

  readonly asset: Asset
  readonly assetString: string
  readonly runeToAssetRatio: BigNumber
  readonly assetToRuneRatio: BigNumber

  constructor(pool: PoolDetail) {
    this.pool = pool
    const asset = assetFromString(this.pool.asset)
    if (!asset) throw new Error(`could not parse ${this.pool.asset}`)

    this.asset = asset
    this.assetString = this.pool.asset
    this.assetBalance = baseAmount(this.pool.assetDepth)
    this.runeBalance = baseAmount(this.pool.runeDepth) //Rune is always 8 decimals

    this.runeToAssetRatio = this.runeBalance.amount().div(this.assetBalance.amount())
    this.assetToRuneRatio = this.assetBalance.amount().div(this.runeBalance.amount())
  }
  isAvailable(): boolean {
    return this.pool.status.toLowerCase() === 'available'
  }
  // /**
  //  * Returns the rune value.
  //  * If the asset passed in is NativeRune, assetAmount is returned back
  //  * If the asset passed in does not match the pool's asset, thow an error, else convert assetAmount into rune value.
  //  *
  //  * @param asset asset type. Should match the asset of the pool
  //  * @param assetAmount - the amount of asset in the value of RUNE
  //  * @returns
  //  */
  // public getValueInRUNE(crytoAmount: CryptoAmount): CryptoAmount {
  //   if (!eqAsset(this.asset, crytoAmount.asset)) {
  //     throw Error(
  //       `cannot getValueInRUNE 2 diff assets ${assetToString(this.asset)} ${assetToString(crytoAmount.asset)}`,
  //     )
  //   }
  //   const baseAmount = crytoAmount.baseAmount.times(this.runeToAssetRatio)
  //   return new CryptoAmount(baseAmount, AssetRuneNative)
  // }
}
