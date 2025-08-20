import { Network } from '../src/index'

describe('XChain Client Base', () => {
  describe('Network', () => {
    it('should have mainnet network', () => {
      expect(Network.Mainnet).toBe('mainnet')
    })

    it('should have testnet network', () => {
      expect(Network.Testnet).toBe('testnet')
    })

    it('should have stagenet network', () => {
      expect(Network.Stagenet).toBe('stagenet')
    })
  })

  describe('Exports', () => {
    it('should export required types and classes', () => {
      const exports = require('../src/index')
      expect(exports.Network).toBeDefined()
      expect(exports.BaseXChainClient).toBeDefined()
      expect(exports.TxType).toBeDefined()
    })
  })
})
