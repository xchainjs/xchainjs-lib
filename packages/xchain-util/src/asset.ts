import BigNumber from 'bignumber.js'

import { fixedBN, formatBN } from './bn'
import { trimZeros as trimZerosHelper } from './string'
import type {
  Amount,
  AnyAsset,
  Asset,
  AssetAmount,
  BaseAmount,
  SecuredAsset,
  SynthAsset,
  TokenAsset,
  TradeAsset,
} from './types'
import { AssetType, Denomination } from './types'

export type Address = string

export const isBigNumberValue = (v: unknown): v is BigNumber.Value =>
  typeof v === 'string' || typeof v === 'number' || v instanceof BigNumber

/**
 * Historical default from Binance chain assets.
 * 0.00000001 RUNE == 1 tor.
 */
const ASSET_DECIMAL = 8

export const NATIVE_ASSET_DELIMITER = '.'

export const TOKEN_ASSET_DELIMITER = '.'

export const SYNTH_ASSET_DELIMITER = '/'

export const TRADE_ASSET_DELIMITER = '~'

export const SECURED_ASSET_DELIMITER = '-'

/** Undefined value becomes 0. */
export const assetAmount = (value: BigNumber.Value | undefined, decimal: number = ASSET_DECIMAL): AssetAmount => {
  const amount = fixedBN(value, decimal)
  return {
    type: Denomination.Asset,
    amount: () => amount,
    plus: (v: BigNumber.Value | AssetAmount, d: number = decimal) =>
      assetAmount(amount.plus(isBigNumberValue(v) ? v : v.amount()), d),
    minus: (v: BigNumber.Value | AssetAmount, d: number = decimal) =>
      assetAmount(amount.minus(isBigNumberValue(v) ? v : v.amount()), d),
    times: (v: BigNumber.Value | AssetAmount, d: number = decimal) =>
      assetAmount(amount.times(isBigNumberValue(v) ? v : v.amount()), d),
    div: (v: BigNumber.Value | AssetAmount, d: number = decimal) =>
      assetAmount(amount.div(isBigNumberValue(v) ? v : v.amount()), d),
    lt: (v: BigNumber.Value | AssetAmount) => amount.lt(isBigNumberValue(v) ? v : v.amount()),
    lte: (v: BigNumber.Value | AssetAmount) => amount.lte(isBigNumberValue(v) ? v : v.amount()),
    gt: (v: BigNumber.Value | AssetAmount) => amount.gt(isBigNumberValue(v) ? v : v.amount()),
    gte: (v: BigNumber.Value | AssetAmount) => amount.gte(isBigNumberValue(v) ? v : v.amount()),
    eq: (v: BigNumber.Value | AssetAmount) => amount.eq(isBigNumberValue(v) ? v : v.amount()),
    decimal,
  }
}

/** Undefined value becomes 0. */
export const baseAmount = (value: BigNumber.Value | undefined, decimal: number = ASSET_DECIMAL): BaseAmount => {
  const amount = fixedBN(value, 0)
  return {
    type: Denomination.Base,
    amount: () => amount,
    plus: (v: BigNumber.Value | BaseAmount, d: number = decimal) =>
      baseAmount(amount.plus(isBigNumberValue(v) ? v : v.amount()), d),
    minus: (v: BigNumber.Value | BaseAmount, d: number = decimal) =>
      baseAmount(amount.minus(isBigNumberValue(v) ? v : v.amount()), d),
    times: (v: BigNumber.Value | BaseAmount, d: number = decimal) =>
      baseAmount(amount.times(isBigNumberValue(v) ? v : v.amount()), d),
    div: (v: BigNumber.Value | BaseAmount, d: number = decimal) =>
      baseAmount(amount.div(isBigNumberValue(v) ? v : v.amount()).decimalPlaces(0, BigNumber.ROUND_DOWN), d),
    lt: (v: BigNumber.Value | BaseAmount) => amount.lt(isBigNumberValue(v) ? v : v.amount()),
    lte: (v: BigNumber.Value | BaseAmount) => amount.lte(isBigNumberValue(v) ? v : v.amount()),
    gt: (v: BigNumber.Value | BaseAmount) => amount.gt(isBigNumberValue(v) ? v : v.amount()),
    gte: (v: BigNumber.Value | BaseAmount) => amount.gte(isBigNumberValue(v) ? v : v.amount()),
    eq: (v: BigNumber.Value | BaseAmount) => amount.eq(isBigNumberValue(v) ? v : v.amount()),
    decimal,
  }
}

export const baseToAsset = (base: BaseAmount): AssetAmount => {
  const decimal = base.decimal
  const value = base
    .amount()
    .div(10 ** decimal)
    .decimalPlaces(decimal)
  return assetAmount(value, decimal)
}

export const assetToBase = (asset: AssetAmount): BaseAmount => {
  const value = asset
    .amount()
    .multipliedBy(10 ** asset.decimal)
    .integerValue()
  return baseAmount(value, asset.decimal)
}

export const isAssetAmount = (v: Amount<Denomination>): v is AssetAmount => v.type === Denomination.Asset

export const isBaseAmount = (v: Amount<Denomination>): v is BaseAmount => v.type === Denomination.Base

/** `trimZeros` wins over `decimal`. */
export const formatAssetAmount = ({
  amount,
  decimal,
  trimZeros = false,
}: {
  amount: AssetAmount
  decimal?: number
  trimZeros?: boolean
}) => {
  // strict check for `undefined` value as negate of 0 will return true and passed decimal value will be ignored
  const formatted = formatBN(amount.amount(), decimal === undefined ? amount.decimal : decimal)
  // Note: `trimZeros` wins over `decimal`
  return trimZeros ? trimZerosHelper(formatted) : formatted
}

export const formatBaseAmount = (amount: BaseAmount) => formatBN(amount.amount(), 0)

/** Thorchain `common` asset shape. @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24 */
const AssetBTC: Asset = { chain: 'BTC', symbol: 'BTC', ticker: 'BTC', type: AssetType.NATIVE }

/** Thorchain `common` asset shape. @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24 */
const AssetETH: Asset = { chain: 'ETH', symbol: 'ETH', ticker: 'ETH', type: AssetType.NATIVE }

export const isValidAsset = (asset: AnyAsset): boolean => !!asset.chain && !!asset.ticker && !!asset.symbol

export const isSynthAsset = (asset: AnyAsset): asset is SynthAsset => asset.type === AssetType.SYNTH

export const isTradeAsset = (asset: AnyAsset): asset is TradeAsset => asset.type === AssetType.TRADE

export const isSecuredAsset = (asset: AnyAsset): asset is SecuredAsset => asset.type === AssetType.SECURED

export const isTokenAsset = (asset: AnyAsset): asset is TokenAsset => asset.type === AssetType.TOKEN

const assetConfigs = new Map<string, AnyAsset>([
  ['KUJI.USK', { chain: 'KUJI', symbol: 'USK', ticker: 'USK', type: AssetType.TOKEN }],
  ['MAYA.MAYA', { chain: 'MAYA', symbol: 'MAYA', ticker: 'MAYA', type: AssetType.TOKEN }],
  ['RUNE', { chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE', type: AssetType.NATIVE }],
  ['X/RUJI', { chain: 'THOR', symbol: 'RUJI', ticker: 'RUJI', type: AssetType.NATIVE }],
])

const createAsset = (chain: string, symbol: string, ticker: string, type: AssetType): AnyAsset => {
  return { chain, symbol, ticker, type }
}

/**
 * Thorchain notation `AAA.BBB-CCC`: chain `AAA`, optional ticker `BBB`, symbol `BBB-CCC` (or `CCC` if no ticker).
 * @see https://docs.thorchain.org/developers/transaction-memos#asset-notation
 */
export const assetFromString = (s: string): AnyAsset | null => {
  if (!s || s.trim() === '') return null

  const directAsset = assetConfigs.get(s)
  if (directAsset) return directAsset

  const assetDelimiters: Record<string, AssetType> = {
    '.': AssetType.NATIVE,
    '/': AssetType.SYNTH,
    '~': AssetType.TRADE,
    '-': AssetType.SECURED,
  }

  const firstDelimiter = Object.keys(assetDelimiters).find((delim) => s.includes(delim)) as
    | keyof typeof assetDelimiters
    | undefined
  if (!firstDelimiter) return null

  const [chain, ...restParts] = s.split(firstDelimiter)

  if (!chain || restParts.length === 0) return null

  // Secured and trade symbols may contain the delimiter again
  const symbol = restParts.join(firstDelimiter)
  let ticker = symbol.split('-')[0]

  const type = assetDelimiters[firstDelimiter]

  // e.g. "BNB." or "AVAX~"
  if (symbol === '') return null
  if (firstDelimiter === '~' || firstDelimiter === '-' || firstDelimiter === '/') {
    return createAsset(chain.trim(), symbol.trim(), ticker.trim(), type)
  }
  if (symbol.includes('-')) {
    const [primaryTicker] = symbol.split('-')
    ticker = primaryTicker

    return createAsset(chain.trim(), symbol.trim(), ticker.trim(), AssetType.TOKEN)
  }
  return createAsset(chain.trim(), symbol.trim(), ticker.trim(), type)
}

export const assetFromStringEx = (s: string): AnyAsset => {
  const asset = assetFromString(s)
  if (!asset) throw Error('asset string not correct')
  return asset
}

/**
 * Thorchain notation `AAA.BBB-CCC`. Synth symbols use `/`.
 * @see https://docs.thorchain.org/developers/transaction-memos#asset-notation
 */
export const assetToString = ({ chain, symbol, type }: AnyAsset) => {
  switch (type) {
    case AssetType.SYNTH:
      return `${chain}${SYNTH_ASSET_DELIMITER}${symbol}`
    case AssetType.TOKEN:
      return `${chain}${TOKEN_ASSET_DELIMITER}${symbol}`
    case AssetType.TRADE:
      return `${chain}${TRADE_ASSET_DELIMITER}${symbol}`
    case AssetType.SECURED:
      return `${chain}${SECURED_ASSET_DELIMITER}${symbol}`
    default:
      return `${chain}${NATIVE_ASSET_DELIMITER}${symbol}`
  }
}

export enum AssetCurrencySymbol {
  RUNE = 'ᚱ',
  BTC = '₿',
  SATOSHI = '⚡',
  ETH = 'Ξ',
  USD = '$',
  DASH = 'Đ',
  LTC = 'Ł',
  DOGE = 'Ð',
  CACAO = '𐌂',
}

export const currencySymbolByAsset = ({ ticker }: AnyAsset): string => {
  switch (true) {
    case ticker === 'RUNE':
      return AssetCurrencySymbol.RUNE
    case ticker === AssetBTC.ticker:
      return AssetCurrencySymbol.BTC
    case ticker === AssetETH.ticker:
      return AssetCurrencySymbol.ETH
    case ticker === 'DASH':
      return AssetCurrencySymbol.DASH
    case ticker === 'LTC':
      return AssetCurrencySymbol.LTC
    case ticker === 'DOGE':
      return AssetCurrencySymbol.DOGE
    case ticker.includes('USD'):
      return AssetCurrencySymbol.USD
    default:
      return ticker
  }
}

/** `trimZeros` wins over `decimal`. */
export const formatAssetAmountCurrency = ({
  amount,
  asset,
  decimal,
  trimZeros: shouldTrimZeros = false,
}: {
  amount: AssetAmount
  asset?: AnyAsset
  decimal?: number
  trimZeros?: boolean
}) => {
  const amountFormatted = formatAssetAmount({
    amount,
    // strict check for `undefined` value as negate of 0 will return true and passed decimal value will be ignored
    decimal: decimal === undefined ? amount.decimal : decimal,
    trimZeros: shouldTrimZeros,
  })
  const ticker = asset?.ticker ?? ''

  if (ticker) {
    if (ticker === 'RUNE') return `${AssetCurrencySymbol.RUNE} ${amountFormatted}`
    let regex = new RegExp(AssetBTC.ticker, 'i')
    if (ticker.match(regex)) {
      const base = assetToBase(amount)
      // format all < ₿ 0.01 in statoshi
      if (base.amount().isLessThanOrEqualTo('1000000')) {
        return `${AssetCurrencySymbol.SATOSHI} ${formatBaseAmount(base)}`
      }
      return `${AssetCurrencySymbol.BTC} ${amountFormatted}`
    }
    regex = new RegExp(AssetETH.ticker, 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.ETH} ${amountFormatted}`
    regex = new RegExp('LTC', 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.LTC} ${amountFormatted}`
    regex = new RegExp('DASH', 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.DASH} ${amountFormatted}`
    regex = new RegExp('DOGE', 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.DOGE} ${amountFormatted}`
    regex = new RegExp('USD', 'i')
    if (ticker.match('USD')) return `${AssetCurrencySymbol.USD} ${amountFormatted}`

    return `${amountFormatted} ${ticker}`
  }

  return `$ ${amountFormatted}`
}

/** `trimZeros` wins over `decimal`. */
export const formatBaseAsAssetAmount = ({
  amount,
  decimal,
  trimZeros = false,
}: {
  amount: BaseAmount
  decimal?: number
  trimZeros?: boolean
}) => formatAssetAmount({ amount: baseToAsset(amount), decimal, trimZeros })

export const eqAsset = (a: AnyAsset, b: AnyAsset) =>
  a.chain === b.chain && a.symbol === b.symbol && a.ticker === b.ticker && a.type === b.type

export const strip0x = (addr: Address) => addr.replace(/^0(x|X)/, '')

export const getContractAddressFromAsset = (asset: TokenAsset): Address => {
  const assetAddress = asset.symbol.slice(asset.ticker.length + 1)
  return strip0x(assetAddress)
}
