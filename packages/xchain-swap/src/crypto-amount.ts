import {
  Asset,
  AssetAmount,
  BaseAmount,
  assetToString,
  baseToAsset,
  eqAsset,
  formatAssetAmountCurrency,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

type CryptoNumeric = CryptoAmount | number | BigNumber

export class CryptoAmount {
  baseAmount: BaseAmount
  readonly asset: Asset
  constructor(amount: BaseAmount, asset: Asset) {
    this.asset = asset
    this.baseAmount = amount
  }
  plus(v: CryptoAmount): CryptoAmount {
    this.check(v)
    const baseAmountResult = this.baseAmount.plus(v.baseAmount)
    return new CryptoAmount(baseAmountResult, this.asset)
  }
  minus(v: CryptoAmount): CryptoAmount {
    this.check(v)
    const baseAmountResult = this.baseAmount.minus(v.baseAmount)
    return new CryptoAmount(baseAmountResult, this.asset)
  }
  times(v: CryptoNumeric): CryptoAmount {
    this.check(v)
    if (v instanceof CryptoAmount) {
      const baseAmountResult = this.baseAmount.times(v.baseAmount)
      return new CryptoAmount(baseAmountResult, this.asset)
    } else {
      const baseAmountResult = this.baseAmount.times(v)
      return new CryptoAmount(baseAmountResult, this.asset)
    }
  }
  div(v: CryptoNumeric): CryptoAmount {
    this.check(v)
    if (v instanceof CryptoAmount) {
      const baseAmountResult = this.baseAmount.div(v.baseAmount)
      return new CryptoAmount(baseAmountResult, this.asset)
    } else {
      const baseAmountResult = this.baseAmount.div(v)
      return new CryptoAmount(baseAmountResult, this.asset)
    }
  }
  lt(v: CryptoAmount): boolean {
    this.check(v)
    return this.baseAmount.lt(v.baseAmount)
  }
  lte(v: CryptoAmount): boolean {
    this.check(v)
    return this.baseAmount.lte(v.baseAmount)
  }
  gt(v: CryptoAmount): boolean {
    this.check(v)
    return this.baseAmount.gt(v.baseAmount)
  }
  gte(v: CryptoAmount): boolean {
    this.check(v)
    return this.baseAmount.gte(v.baseAmount)
  }
  eq(v: CryptoAmount): boolean {
    this.check(v)
    return this.baseAmount.eq(v.baseAmount)
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
  private check(v: CryptoNumeric) {
    if (v instanceof CryptoAmount) {
      if (!eqAsset(this.asset, v.asset)) {
        throw Error(`cannot perform math on 2 diff assets ${assetToString(this.asset)} ${assetToString(v.asset)}`)
      }
    }
  }
}
