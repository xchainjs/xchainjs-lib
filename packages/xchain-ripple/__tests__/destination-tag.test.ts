import { validateDestinationTag, parseDestinationTag } from '../src/utils'

describe('Destination Tag Utils', () => {
  describe('validateDestinationTag', () => {
    it('should validate correct destination tags', () => {
      expect(validateDestinationTag(0)).toBe(true)
      expect(validateDestinationTag(12345)).toBe(true)
      expect(validateDestinationTag(4294967295)).toBe(true) // Max value (2^32 - 1)
    })

    it('should reject invalid destination tags', () => {
      expect(validateDestinationTag(-1)).toBe(false)
      expect(validateDestinationTag(4294967296)).toBe(false) // Max + 1
      expect(validateDestinationTag(1.5)).toBe(false) // Not an integer
      expect(validateDestinationTag(NaN)).toBe(false)
      expect(validateDestinationTag(Infinity)).toBe(false)
    })
  })

  describe('parseDestinationTag', () => {
    it('should parse valid number destination tags', () => {
      expect(parseDestinationTag(0)).toBe(0)
      expect(parseDestinationTag(12345)).toBe(12345)
      expect(parseDestinationTag(4294967295)).toBe(4294967295)
    })

    it('should parse valid string destination tags', () => {
      expect(parseDestinationTag('0')).toBe(0)
      expect(parseDestinationTag('12345')).toBe(12345)
      expect(parseDestinationTag('4294967295')).toBe(4294967295)
    })

    it('should return undefined for invalid destination tags', () => {
      expect(parseDestinationTag(-1)).toBeUndefined()
      expect(parseDestinationTag('-1')).toBeUndefined()
      expect(parseDestinationTag('invalid')).toBeUndefined()
      expect(parseDestinationTag('1.5')).toBeUndefined()
      expect(parseDestinationTag(4294967296)).toBeUndefined()
      expect(parseDestinationTag('4294967296')).toBeUndefined()
    })
  })
})
