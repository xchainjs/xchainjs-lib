import BigNumber from 'bignumber.js'

/**
 * Shortcut to create a BigNumber
 *
 * @param {string | number | BigNumber.Instance} value
 * @returns {BigNumber} The BigNumber interface from the given value.
 */
const bn = (value: BigNumber.Value) => new BigNumber(value)

/**
 * Helper to check whether a BigNumber is valid or not
 *
 * @param {BigNumber} value
 * @returns {boolean} `true` or `false`.
 * */
export const isValidBN = (value: BigNumber) => !value.isNaN()

/**
 * Helper to create a big number from string or number
 * If it fails to create a big number, a big number with value 0 will be returned instead
 *
 * @param {string|number|undefined} value
 * @returns {BigNumber} The BigNumber interface from the given value. If invalid one is provided, will return `0`.
 * */
export const bnOrZero = (value: string | number | undefined) => {
  const b = value ? bn(value) : bn(0)
  return isValidBN(b) ? b : bn(0)
}

/**
 * Helper to validate a possible BigNumber
 * If the given value is invalid or undefined, 0 is returned as a BigNumber
 *
 * @param {BigNumber|undefined} value
 * @returns {boolean} `true` or `false`.
 */
export const validBNOrZero = (value: BigNumber | undefined) => (value && isValidBN(value) ? value : bn(0))

/**
 * Format a BaseNumber to a string depending on given decimal places
 *
 * @param {BigNumber} value
 * @param {number} decimal The decimal place. (optional)
 * @returns {string} The formatted string from the given BigNumber and decimal place.
 * */
export const formatBN = (value: BigNumber, decimal = 2) => value.toFormat(decimal)

/**
 * The enumuration for symbol position.
 * `before` or `after`
 */
export enum SymbolPosition {
  BEFORE = 'before',
  AFTER = 'after',
}
/**
 * Formats a big number value by prefixing it with `$`
 *
 * @param {BigNumber} n
 * @param {number} decimalPlaces The decimal place. (optional)
 * @param {string} symbol The currency symbol. (optional)
 * @param {position} position The symbol position. (optional)
 * @returns {string} The formatted string from the given BigNumber, decimal places, symbol and position.
 */
export const formatBNCurrency = (
  n: BigNumber,
  decimalPlaces = 2,
  symbol = '$',
  position: SymbolPosition = SymbolPosition.BEFORE,
) => {
  const value = formatBN(n, decimalPlaces)
  if (position === SymbolPosition.BEFORE) {
    return `${symbol}${value}`
  }
  return `${value}${symbol}`
}

/**
 * Helper to get a fixed `BigNumber`
 * Returns zero `BigNumber` if `value` is invalid
 *
 * @param {number|string|BigNumber|undefined} value
 * @param {number} decimalPlaces The decimal place. (optional)
 * @returns {BigNumber} The BigNumber interface from the given value and decimal.
 * */
export const fixedBN = (value: BigNumber.Value | undefined, decimalPlaces = 2): BigNumber => {
  const n = bn(value || 0)
  const fixedBN = isValidBN(n) ? n.toFixed(decimalPlaces) : bn(0).toFixed(decimalPlaces)
  return bn(fixedBN)
}

export default bn
