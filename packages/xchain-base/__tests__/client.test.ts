import { Network } from '@xchainjs/xchain-client'

describe('Base Client', () => {
  describe('Client Exports', () => {
    it('should export Client class', () => {
      const clientModule = require('../src/index')
      expect(clientModule.Client).toBeDefined()
    })

    it('should export default client params', () => {
      const clientModule = require('../src/index')
      expect(clientModule.defaultParams || clientModule.defaultBaseParams).toBeDefined()
    })
  })

  describe('Constants', () => {
    it('should export chain and asset constants', () => {
      const constants = require('../src/index')
      expect(constants).toBeDefined()
    })
  })

  describe('Network Configuration', () => {
    it('should support all networks', () => {
      expect(Network.Mainnet).toBe('mainnet')
      expect(Network.Testnet).toBe('testnet')
      expect(Network.Stagenet).toBe('stagenet')
    })
  })
})
