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

/**
 * Guard to check whether value is a BigNumber.Value or not
 *
 * @param {unknown} v
 * @returns {boolean} `true` or `false`.
 * */
export const isBigNumberValue = (v: unknown): v is BigNumber.Value =>
  typeof v === 'string' || typeof v === 'number' || v instanceof BigNumber

/**
 * Default number of asset decimals
 * For history reason and by starting the project on Binance chain assets, it's 8 decimal.F
 *
 * For example:
 * ```
 * RUNE has a maximum of 8 digits of decimal
 * 0.00000001 RUNE == 1 ð (tor)
 * ```
 * */
const ASSET_DECIMAL = 8

/**
 * Native asset delimiter
 */
export const NATIVE_ASSET_DELIMITER = '.'

/**
 * Token asset delimiter
 */
export const TOKEN_ASSET_DELIMITER = '.'

/**
 * Synth asset delimiter
 */
export const SYNTH_ASSET_DELIMITER = '/'

/**
 * Trade asset delimiter
 */
export const TRADE_ASSET_DELIMITER = '~'

/**
 * Secured asset delimiter
 */
export const SECURED_ASSET_DELIMITER = '-'

/**
 * Factory to create values of assets (e.g. RUNE)
 *
 * @param {string|number|BigNumber|undefined} value - The asset amount, If the value is undefined, AssetAmount with value `0` will be returned.
 * @param {number} decimal The decimal places. (optional)
 * @returns {AssetAmount} The asset amount from the given value and decimal.
 *
 **/
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

/**
 * Factory to create base amounts (e.g. tor)
 *
 * @param {string|number|BigNumber|undefined} value - The base amount, If the value is undefined, BaseAmount with value `0` will be returned.
 * @param {number} decimal The decimal places of its associated AssetAmount. (optional)
 * @returns {BaseAmount} The base amount from the given value and decimal.
 **/
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

/**
 * Helper to convert values for a asset from base values (e.g. RUNE from tor)
 *
 * @param {BaseAmount} base
 * @returns {AssetAmount} The asset amount from the given base amount.
 * */
export const baseToAsset = (base: BaseAmount): AssetAmount => {
  const decimal = base.decimal
  const value = base
    .amount()
    .div(10 ** decimal)
    .decimalPlaces(decimal)
  return assetAmount(value, decimal)
}

/**
 * Helper to convert asset to base values (e.g. tor -> RUNE)
 *
 * @param {AssetAmount} asset
 * @returns {BaseAmount} The base amount from the given AssetAmount.
 * */
export const assetToBase = (asset: AssetAmount): BaseAmount => {
  const value = asset
    .amount()
    .multipliedBy(10 ** asset.decimal)
    .integerValue()
  return baseAmount(value, asset.decimal)
}

/**
 * Guard to check whether value is an amount of asset or not
 *
 * @param {Amount<Denomination>} v
 * @returns {boolean} `true` or `false`.
 * */
export const isAssetAmount = (v: Amount<Denomination>): v is AssetAmount => v.type === Denomination.Asset

/**
 * Guard to check whether value is an amount of a base value or not
 *
 * @param {Amount<Denomination>} v
 * @returns {boolean} `true` or `false`.
 * */
export const isBaseAmount = (v: Amount<Denomination>): v is BaseAmount => v.type === Denomination.Base

/**
 * Formats an `AssetAmount` into `string` based on decimal places
 *
 * If `decimal` is not set, `amount.decimal` is used
 * Note: `trimZeros` wins over `decimal`
 *
 * @param {Params} param The asset amount format options.
 * @returns {string} The formatted asset amount string from the given options.
 */
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

/**
 * Formats a `BaseAmount` value into a `string`
 *
 * @param {BaseAmount} amount
 * @returns {string} The formatted base amount string from the given base amount.
 */
export const formatBaseAmount = (amount: BaseAmount) => formatBN(amount.amount(), 0)

/**
 * Base "chain" asset on bitcoin main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
const AssetBTC: Asset = { chain: 'BTC', symbol: 'BTC', ticker: 'BTC', type: AssetType.NATIVE }

/**
 * Base "chain" asset on ethereum main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
const AssetETH: Asset = { chain: 'ETH', symbol: 'ETH', ticker: 'ETH', type: AssetType.NATIVE }

/**
 * Helper to check whether asset is valid
 *
 * @param {Asset} asset
 * @returns {boolean} `true` or `false`
 */
export const isValidAsset = (asset: AnyAsset): boolean => !!asset.chain && !!asset.ticker && !!asset.symbol

/**
 * Helper to check whether an asset is synth asset
 *
 * @param {Asset} asset
 * @returns {boolean} `true` or `false`
 */
export const isSynthAsset = (asset: AnyAsset): asset is SynthAsset => asset.type === AssetType.SYNTH

/**
 * Helper to check whether an asset is trade asset
 *
 * @param {AnyAsset} asset
 * @returns {boolean} `true` or `false`
 */
export const isTradeAsset = (asset: AnyAsset): asset is TradeAsset => asset.type === AssetType.TRADE

/**
 * Helper to check whether an asset is secured asset
 *
 * @param {AnyAsset} asset
 * @returns {boolean} `true` or `false`
 */
export const isSecuredAsset = (asset: AnyAsset): asset is SecuredAsset => asset.type === AssetType.SECURED

/**
 *
 * @param {AnyAsset} asset
 * @returns {boolean} `true` or `false`
 */
export const isTokenAsset = (asset: AnyAsset): asset is TokenAsset => asset.type === AssetType.TOKEN

/**
 * Creates an `Asset` by a given string
 *
 * This helper function expects a string with following naming convention:
 * `AAA.BBB-CCC`
 * where
 * chain: `AAA`
 * ticker (optional): `BBB`
 * symbol: `BBB-CCC` or `CCC` (if no ticker available)
 *
 * @see  https://docs.thorchain.org/developers/transaction-memos#asset-notation
 *
 * If the naming convention fails, it returns null
 *
 * @param {string} s The given string.
 * @returns {Asset|null} The asset from the given string.
 */
const assetConfigs = new Map<string, AnyAsset>([
  ['KUJI.USK', { chain: 'KUJI', symbol: 'USK', ticker: 'USK', type: AssetType.TOKEN }],
  ['MAYA.MAYA', { chain: 'MAYA', symbol: 'MAYA', ticker: 'MAYA', type: AssetType.TOKEN }],
  ['RUNE', { chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE', type: AssetType.NATIVE }],
  ['X/RUJI', { chain: 'THOR', symbol: 'RUJI', ticker: 'RUJI', type: AssetType.NATIVE }],
])

// Helper function to create an asset from its components
const createAsset = (chain: string, symbol: string, ticker: string, type: AssetType): AnyAsset => {
  return { chain, symbol, ticker, type }
}

export const assetFromString = (s: string): AnyAsset | null => {
  if (!s || s.trim() === '') return null // Handle empty strings

  // Check if the asset is directly in the assetConfigs
  const directAsset = assetConfigs.get(s)
  if (directAsset) return directAsset

  // Define asset delimiters for the first delimiter
  const assetDelimiters: Record<string, AssetType> = {
    '.': AssetType.NATIVE,
    '/': AssetType.SYNTH,
    '~': AssetType.TRADE,
    '-': AssetType.SECURED,
  }

  // Identify the first delimiter in the string
  const firstDelimiter = Object.keys(assetDelimiters).find((delim) => s.includes(delim)) as
    | keyof typeof assetDelimiters
    | undefined
  if (!firstDelimiter) return null

  // Split the string into chain and symbol part based on the first delimiter
  const [chain, ...restParts] = s.split(firstDelimiter)

  if (!chain || restParts.length === 0) return null // Invalid format or empty parts

  // Handle secured and trade assets which may have further splits
  const symbol = restParts.join(firstDelimiter)
  let ticker = symbol.split('-')[0]

  // For secured and trade assets, handle contract address as part of the symbol
  const type = assetDelimiters[firstDelimiter]

  // Check if symbol is empty (e.g., BNB. or AVAX~ cases)
  if (symbol === '') return null
  // Handle trade and secured assets
  if (firstDelimiter === '~' || firstDelimiter === '-' || firstDelimiter === '/') {
    return createAsset(chain.trim(), symbol.trim(), ticker.trim(), type)
  }
  // Handle token assets: if the symbol has more than one part (split by `-`)
  if (symbol.includes('-')) {
    const [primaryTicker] = symbol.split('-')
    ticker = primaryTicker

    // For token assets, use the contract address
    return createAsset(chain.trim(), symbol.trim(), ticker.trim(), AssetType.TOKEN)
  }
  // For native, synth, or other types of assets
  return createAsset(chain.trim(), symbol.trim(), ticker.trim(), type)
}

/**
 * Similar to an `assetFromString`, but throws an exception for invalid asset strings
 */
export const assetFromStringEx = (s: string): AnyAsset => {
  const asset = assetFromString(s)
  if (!asset) throw Error('asset string not correct')
  return asset
}

/**
 * Returns an `Asset` as a string using following naming convention:
 *
 * `AAA.BBB-CCC`
 * where
 * chain: `AAA`
 * ticker (optional): `BBB`
 * symbol: `BBB-CCC` or `CCC` (if no ticker available)
 * symbol (synth): `BBB/CCC` or `CCC` (if no ticker available)
 *
 * @see https://docs.thorchain.org/developers/transaction-memos#asset-notation
 *
 * @param {Asset} asset The given asset.
 * @returns {string} The string from the given asset.
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

/**
 * Currency symbols currently supported
 */
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

/**
 * Returns currency symbols by given `Asset`
 *
 * @param {Asset} asset The given asset.
 * @returns {string} The currency symbol from the given asset.
 */
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

/**
 * Formats an asset amount using its currency symbol
 *
 * If `decimal` is not set, `amount.decimal` is used
 * If `asset` is not set, `$` will be used as currency symbol by default
 * `trimZeros` is `false` by default
 * Note: `trimZeros` wins over `decimal`
 *
 * @param {Params} params The asset amount currency format options.
 * @return {string} The formatted asset amount string using its currency format.
 */
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
    // RUNE
    if (ticker === 'RUNE') return `${AssetCurrencySymbol.RUNE} ${amountFormatted}`
    // BTC
    let regex = new RegExp(AssetBTC.ticker, 'i')
    if (ticker.match(regex)) {
      const base = assetToBase(amount)
      // format all < ₿ 0.01 in statoshi
      if (base.amount().isLessThanOrEqualTo('1000000')) {
        return `${AssetCurrencySymbol.SATOSHI} ${formatBaseAmount(base)}`
      }
      return `${AssetCurrencySymbol.BTC} ${amountFormatted}`
    }
    // ETH
    regex = new RegExp(AssetETH.ticker, 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.ETH} ${amountFormatted}`
    // LTC
    regex = new RegExp('LTC', 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.LTC} ${amountFormatted}`
    // DASH
    regex = new RegExp('DASH', 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.DASH} ${amountFormatted}`
    // DOGE
    regex = new RegExp('DOGE', 'i')
    if (ticker.match(regex)) return `${AssetCurrencySymbol.DOGE} ${amountFormatted}`
    // USD
    regex = new RegExp('USD', 'i')
    if (ticker.match('USD')) return `${AssetCurrencySymbol.USD} ${amountFormatted}`

    return `${amountFormatted} ${ticker}`
  }

  return `$ ${amountFormatted}`
}

/**
 * Formats a `BaseAmount` into a string of an `AssetAmount`
 *
 * If `decimal` is not set, `amount.decimal` is used
 * Note: `trimZeros` wins over `decimal`
 *
 * @param {Params} params The base amount currency format options.
 * @return {string} The formatted base amount string using its currency format.
 */
export const formatBaseAsAssetAmount = ({
  amount,
  decimal,
  trimZeros = false,
}: {
  amount: BaseAmount
  decimal?: number
  trimZeros?: boolean
}) => formatAssetAmount({ amount: baseToAsset(amount), decimal, trimZeros })

/**
 * Checks equality of two `Assets`
 * @param {Asset} a Asset one
 * @param {Asset} b Asset two
 * @return {boolean} Result of equality check
 */
export const eqAsset = (a: AnyAsset, b: AnyAsset) =>
  a.chain === b.chain && a.symbol === b.symbol && a.ticker === b.ticker && a.type === b.type

/**
 * Removes `0x` or `0X` from address
 */
export const strip0x = (addr: Address) => addr.replace(/^0(x|X)/, '')

export const getContractAddressFromAsset = (asset: TokenAsset): Address => {
  const assetAddress = asset.symbol.slice(asset.ticker.length + 1)
  return strip0x(assetAddress)
}
