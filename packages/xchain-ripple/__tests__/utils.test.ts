import { validateAddress } from '../src/utils'

describe('XRP Utils', () => {
  describe('Address Validation', () => {
    it('should validate correct XRP addresses', () => {
      const validAddresses = [
        'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
        'rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w'
      ]

      validAddresses.forEach(address => {
        expect(validateAddress(address)).toBe(true)
      })
    })

    it('should reject invalid XRP addresses', () => {
      const invalidAddresses = [
        '',
        'invalid',
        '123456789',
        'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzR', // too short
        'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRHX', // too long
        '1N7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH', // wrong prefix
        'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRO' // invalid checksum
      ]

      invalidAddresses.forEach(address => {
        expect(validateAddress(address)).toBe(false)
      })
    })

    it('should handle null and undefined', () => {
      expect(validateAddress(null as any)).toBe(false)
      expect(validateAddress(undefined as any)).toBe(false)
    })
  })
})