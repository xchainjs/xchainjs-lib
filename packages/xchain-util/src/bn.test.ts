import {
  SymbolPosition,
  bnOrZero,
  default as bn,
  fixedBN,
  formatBN,
  formatBNCurrency,
  isValidBN,
  validBNOrZero,
} from './bn'

describe('util/bn', () => {
  describe('bn', () => {
    it('should create a BigNumber', () => {
      const result = bn(10)
      expect(result).toEqual(bn(10))
    })
  })

  describe('isValidBN', () => {
    it('should be `true` for a valid number', () => {
      const result = isValidBN(bn(10))
      expect(result).toBeTruthy()
    })
    it('should be `true` for a valid number as string', () => {
      const result = isValidBN(bn('10.01'))
      expect(result).toBeTruthy()
    })
    it('should be `false` for values of NaN', () => {
      const result = isValidBN(bn(NaN))
      expect(result).toBeFalsy()
    })
    it('should be still `true` for values of Infinity', () => {
      const result = isValidBN(bn(Infinity))
      expect(result).toBeTruthy()
    })
  })

  describe('bnOrZero', () => {
    it('should return a BigNumber by a given number', () => {
      expect(bnOrZero(10)).toEqual(bn(10))
    })
    it('should return a BigNumber by a given number as string', () => {
      expect(bnOrZero('10.01')).toEqual(bn(10.01))
    })
    it('should return `0` as BigNumber for undefined values', () => {
      expect(bnOrZero(undefined)).toEqual(bn(0))
    })
    it('should return `0` as BigNumber for invalid string', () => {
      expect(bnOrZero('unknown')).toEqual(bn(0))
    })
    it('should return `0` as BigNumber for empty string', () => {
      expect(bnOrZero('')).toEqual(bn(0))
    })
  })

  describe('formatBN', () => {
    it('formats a BigNumber with 2 decimal', () => {
      const n = bn(10)
      expect(formatBN(n)).toEqual('10.00')
    })
    it('formats a BigNumber with 4 decimal', () => {
      const n = bn(10)
      expect(formatBN(n, 4)).toEqual('10.0000')
    })

    it('formats a BigNumber with 2 decimal and group separators', () => {
      const n = bn(123000000.3364)
      expect(formatBN(n)).toEqual('123,000,000.34')
    })
  })

  describe('formatBNCurrency', () => {
    it('formats a BigNumber as currency', () => {
      const n = bn(10)
      expect(formatBNCurrency(n)).toEqual('$10.00')
    })
    it('formats 0 as BigNumber based currency', () => {
      const n = bn(0)
      expect(formatBNCurrency(n)).toEqual('$0.00')
    })
    it('position custom symbol before', () => {
      expect(formatBNCurrency(bn(1000), 0, '€')).toEqual('€1,000')
    })
    it('position custom symbol after', () => {
      expect(formatBNCurrency(bn(1000), 0, 'ð', SymbolPosition.AFTER)).toEqual('1,000ð')
    })

    it('formats a BigNumber with 2 decimal and group separators', () => {
      const n = bn(123000000.3364)
      expect(formatBN(n)).toEqual('123,000,000.34')
    })
  })

  describe('bnValidOrZero', () => {
    it('returns a given, valid BigNumber', () => {
      const n = bn(10)
      expect(validBNOrZero(n)).toEqual(n)
    })
    it('returns 0, if given value is undefined', () => {
      expect(validBNOrZero(undefined)).toEqual(bn(0))
    })
    it('returns 0, if given value is invalid', () => {
      expect(validBNOrZero(bn('xyz'))).toEqual(bn(0))
    })
  })

  describe('getFixedBigNumber', () => {
    it('returns a valid value', () => {
      const result = fixedBN(100.888787, 3)
      expect(result).toEqual(bn(100.889))
    })
    it('returns 0 from invalid string input', () => {
      const result = fixedBN('hello')
      expect(result).toEqual(bn(0))
    })
    it('returns 0 from invalid number input', () => {
      const result = fixedBN(NaN)
      expect(result).toEqual(bn(0))
    })
    it('returns 0 w/o an input ', () => {
      const result = fixedBN(undefined)
      expect(result).toEqual(bn(0))
    })
  })
})
