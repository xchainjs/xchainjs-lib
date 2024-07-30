import { BigNumber } from 'bignumber.js'

import {
  AnyAsset,
  Asset,
  AssetAmount,
  BaseAmount,
  SynthAsset,
  TokenAsset,
  assetToBase,
  assetToString,
  baseToAsset,
  eqAsset,
  formatAssetAmountCurrency,
} from './'

/**
 * Utility Class to combine an amount (asset/base) with the Asset
 *
 */
class BaseCryptoAmount<T extends AnyAsset> {
  baseAmount: BaseAmount
  readonly asset: T

  constructor(amount: BaseAmount, asset: T) {
    this.asset = asset
    this.baseAmount = amount
  }

  plus(v: BaseCryptoAmount<T>): BaseCryptoAmount<T> {
    this.check(v)
    const assetAmountResult = assetToBase(this.assetAmount.plus(v.assetAmount))
    return new BaseCryptoAmount(assetAmountResult, this.asset)
  }

  minus(v: BaseCryptoAmount<T>): BaseCryptoAmount<T> {
    this.check(v)
    const assetAmountResult = assetToBase(this.assetAmount.minus(v.assetAmount))
    return new BaseCryptoAmount(assetAmountResult, this.asset)
  }

  times(v: BaseCryptoAmount<T> | number | BigNumber): BaseCryptoAmount<T> {
    this.check(v)
    if (v instanceof BaseCryptoAmount) {
      const assetAmountResult = assetToBase(this.assetAmount.times(v.assetAmount))
      return new BaseCryptoAmount(assetAmountResult, this.asset)
    } else {
      const assetAmountResult = assetToBase(this.assetAmount.times(v))
      return new BaseCryptoAmount(assetAmountResult, this.asset)
    }
  }

  div(v: BaseCryptoAmount<T> | number | BigNumber): BaseCryptoAmount<T> {
    this.check(v)
    if (v instanceof BaseCryptoAmount) {
      const assetAmountResult = assetToBase(this.assetAmount.div(v.assetAmount))
      return new BaseCryptoAmount(assetAmountResult, this.asset)
    } else {
      const assetAmountResult = assetToBase(this.assetAmount.div(v))
      return new BaseCryptoAmount(assetAmountResult, this.asset)
    }
  }

  lt(v: BaseCryptoAmount<T>): boolean {
    this.check(v)
    return this.assetAmount.lt(v.assetAmount)
  }

  lte(v: BaseCryptoAmount<T>): boolean {
    this.check(v)
    return this.assetAmount.lte(v.assetAmount)
  }

  gt(v: BaseCryptoAmount<T>): boolean {
    this.check(v)
    return this.assetAmount.gt(v.assetAmount)
  }

  gte(v: BaseCryptoAmount<T>): boolean {
    this.check(v)

    return this.assetAmount.gte(v.assetAmount)
  }

  eq(v: BaseCryptoAmount<T>): boolean {
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
  private check(v: BaseCryptoAmount<T> | number | BigNumber) {
    if (v instanceof BaseCryptoAmount) {
      if (!eqAsset(this.asset, v.asset)) {
        throw Error(`cannot perform math on 2 diff assets ${assetToString(this.asset)} ${assetToString(v.asset)}`)
      }
    }
  }
}

export class CryptoAmount<T extends AnyAsset = AnyAsset> extends BaseCryptoAmount<T> {}
export class AssetCryptoAmount extends BaseCryptoAmount<Asset> {}
export class TokenCryptoAmount extends BaseCryptoAmount<TokenAsset> {}
export class SynthCryptoAmount extends BaseCryptoAmount<SynthAsset> {}
