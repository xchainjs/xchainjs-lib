import { Network } from '@xchainjs/xchain-client'
import * as bchaddr from '../src/bchaddrjs'
import mockHaskoinApi from '../__mocks__/haskoin'
import * as Utils from '../src/utils'

describe('Bitcoin Cash Utils Test', () => {
  beforeEach(() => {
    mockHaskoinApi.init()
  })
  afterEach(() => {
    mockHaskoinApi.restore()
  })

  const testnet_address = 'bchtest:qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g'
  const mainnet_address = 'bitcoincash:qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj'
  const legacy_mainnet = '1Anw7uzLwXxBykMLeKb2BPAyTKsSfVDA8A'

  describe('stripPrefix', () => {
    it('should strip out the prefix from the testnet address', () => {
      const strip_address = Utils.stripPrefix(testnet_address)
      expect(strip_address).toEqual('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
    })

    it('should strip out the prefix from the mainnet address', () => {
      const strip_address = Utils.stripPrefix(mainnet_address)
      expect(strip_address).toEqual('qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj')
    })

    it('should leave unprefixed address intact', () => {
      const strip_address = Utils.stripPrefix('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
      expect(strip_address).toEqual('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
    })
  })

  describe('toBCHAddressNetwork', () => {
    it('returns `bchaddr.Network.Mainnet` in case of `mainnet', () => {
      expect(Utils.toBCHAddressNetwork(Network.Mainnet)).toEqual(bchaddr.Network.Mainnet)
    })
    it('returns `bchaddr.Network.Testnet` in case of `testnet', () => {
      expect(Utils.toBCHAddressNetwork(Network.Testnet)).toEqual(bchaddr.Network.Testnet)
    })
  })

  describe('toLegacyAddress', () => {
    it('converts cashaddr to legacy', () => {
      const legacy = Utils.toLegacyAddress(mainnet_address)
      expect(legacy).toEqual(legacy_mainnet)
    })
  })
  describe('toCashAddress', () => {
    it('converts legacy to cashaddr', () => {
      const cashaddr = Utils.toCashAddress(legacy_mainnet)
      expect(cashaddr).toEqual(mainnet_address)
    })
  })

  describe('isCashAddress', () => {
    it('returns true for a valid cash address', () => {
      expect(Utils.isCashAddress(mainnet_address)).toBe(true)
    })

    it('returns false for a legacy address', () => {
      expect(Utils.isCashAddress(legacy_mainnet)).toBe(false)
    })
  })

  describe('validateAddress', () => {
    it('returns true for a valid testnet address and testnet network', () => {
      expect(Utils.validateAddress(testnet_address, Network.Testnet)).toBe(true)
    })

    it('returns true for a valid mainnet address and mainnet network', () => {
      expect(Utils.validateAddress(mainnet_address, Network.Mainnet)).toBe(true)
    })

    it('returns false if address network doesn’t match given network', () => {
      expect(Utils.validateAddress(mainnet_address, Network.Testnet)).toBe(false)
    })

    it('throws error for invalid address', () => {
      expect(() => Utils.validateAddress('invalid-address', Network.Mainnet)).toThrow()
    })
  })
})
