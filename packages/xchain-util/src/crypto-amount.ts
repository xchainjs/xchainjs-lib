import { BigNumber } from 'bignumber.js'

import {
  Asset,
  AssetAmount,
  BaseAmount,
  assetToBase,
  assetToString,
  baseToAsset,
  eqAsset,
  formatAssetAmountCurrency,
} from './'

type CryptoNumeric = CryptoAmount | number | BigNumber

/**
 * Utility Class to combine an amount (asset/base) with the Asset
 *
 */
export class CryptoAmount {
  baseAmount: BaseAmount
  readonly asset: Asset
  constructor(amount: BaseAmount, asset: Asset) {
    this.asset = asset
    this.baseAmount = amount
  }
  plus(v: CryptoAmount): CryptoAmount {
    this.check(v)
    const assetAmountResult = assetToBase(this.assetAmount.plus(v.assetAmount))
    return new CryptoAmount(assetAmountResult, this.asset)
  }
  minus(v: CryptoAmount): CryptoAmount {
    this.check(v)
    const assetAmountResult = assetToBase(this.assetAmount.minus(v.assetAmount))
    return new CryptoAmount(assetAmountResult, this.asset)
  }
  times(v: CryptoNumeric): CryptoAmount {
    this.check(v)
    if (v instanceof CryptoAmount) {
      const assetAmountResult = assetToBase(this.assetAmount.times(v.assetAmount))
      return new CryptoAmount(assetAmountResult, this.asset)
    } else {
      const assetAmountResult = assetToBase(this.assetAmount.times(v))
      return new CryptoAmount(assetAmountResult, this.asset)
    }
  }
  div(v: CryptoNumeric): CryptoAmount {
    this.check(v)
    if (v instanceof CryptoAmount) {
      const assetAmountResult = assetToBase(this.assetAmount.div(v.assetAmount))
      return new CryptoAmount(assetAmountResult, this.asset)
    } else {
      const assetAmountResult = assetToBase(this.assetAmount.div(v))
      return new CryptoAmount(assetAmountResult, this.asset)
    }
  }
  lt(v: CryptoAmount): boolean {
    this.check(v)
    return this.assetAmount.lt(v.assetAmount)
  }
  lte(v: CryptoAmount): boolean {
    this.check(v)
    return this.assetAmount.lte(v.assetAmount)
  }
  gt(v: CryptoAmount): boolean {
    this.check(v)
    return this.assetAmount.gt(v.assetAmount)
  }
  gte(v: CryptoAmount): boolean {
    this.check(v)

    return this.assetAmount.gte(v.assetAmount)
  }
  eq(v: CryptoAmount): boolean {
    this.check(v)
    return this.assetAmount.eq(v.assetAmount)
  }
  formatedAssetString(): string {
    return formatAssetAmountCurrency({
      amount: this.assetAmount,
      asset: this.asset,
      trimZeros: true,
    })
  }
  assetAmountFixedString(): string {
    return this.assetAmount.amount().toFixed()
  }
  get assetAmount(): AssetAmount {
    return baseToAsset(this.baseAmount)
  }
  /**
   * This guard protects against trying to perform math with different assets
   *
   * Example.
   * const x = new CryptoAmount(assetAmount(1),AssetBTC)
   * const y = new CryptoAmount(assetAmount(1),AssetETH)
   *
   * x.plus(y) <- will throw error "cannot perform math on 2 diff assets BTC.BTC ETH.ETH
   *
   * @param v - CryptoNumeric
   */
  private check(v: CryptoNumeric) {
    if (v instanceof CryptoAmount) {
      if (!eqAsset(this.asset, v.asset)) {
        throw Error(`cannot perform math on 2 diff assets ${assetToString(this.asset)} ${assetToString(v.asset)}`)
      }
    }
  }
}
