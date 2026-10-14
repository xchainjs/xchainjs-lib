import BigNumber from 'bignumber.js'

const bn = (value: BigNumber.Value) => new BigNumber(value)

export const isValidBN = (value: BigNumber) => !value.isNaN()

export const bnOrZero = (value: string | number | undefined) => {
  try {
    const b = value ? bn(value) : bn(0)
    return isValidBN(b) ? b : bn(0)
  } catch {
    return bn(0)
  }
}

export const validBNOrZero = (value: BigNumber | undefined) => {
  try {
    return value && isValidBN(value) ? value : bn(0)
  } catch {
    return bn(0)
  }
}

export const formatBN = (value: BigNumber, decimal = 2) => value.toFormat(decimal)

export enum SymbolPosition {
  BEFORE = 'before',
  AFTER = 'after',
}

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

/** Invalid `value` becomes zero. */
export const fixedBN = (value: BigNumber.Value | undefined, decimalPlaces = 2): BigNumber => {
  try {
    const n = bn(value || 0)
    const fixed = isValidBN(n) ? n.toFixed(decimalPlaces) : bn(0).toFixed(decimalPlaces)
    return bn(fixed)
  } catch {
    return bn(bn(0).toFixed(decimalPlaces))
  }
}

export default bn
