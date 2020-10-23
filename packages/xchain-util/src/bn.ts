import BigNumber from 'bignumber.js'

/**
 * Shortcut to create a BigNumber
 */
const bn = (value: BigNumber.Value) => new BigNumber(value)

/**
 * Helper to check whether a BigNumber is valid or not
 * */
export const isValidBN = (value: BigNumber) => !value.isNaN()

/**
 * Helper to create a big number from string or number
 * If it fails to create a big number, a big number with value 0 will be returned instead
 * */
export const bnOrZero = (value: string | number | undefined) => {
  const b = value ? bn(value) : bn(0)
  return isValidBN(b) ? b : bn(0)
}

/**
 * Helper to validate a possible BigNumber
 * If the given valie is invalid or undefined, 0 is returned as a BigNumber
 */
export const validBNOrZero = (value: BigNumber | undefined) => (value && isValidBN(value) ? value : bn(0))

/**
 * Format a BaseNumber to a string depending on given decimal places
 * */
export const formatBN = (value: BigNumber, decimalPlaces = 2) => value.toFormat(decimalPlaces)

export enum SymbolPosition {
  BEFORE = 'before',
  AFTER = 'after',
}
/**
 * Formats a big number value by prefixing it with `$`
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
 * */
export const fixedBN = (value: number | string | BigNumber | undefined, decimalPlaces = 2): BigNumber => {
  const n = bn(value || 0)
  const fixedBN = isValidBN(n) ? n.toFixed(decimalPlaces) : bn(0).toFixed(decimalPlaces)
  return bn(fixedBN)
}

export default bn
