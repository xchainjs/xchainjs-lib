describe('@xchainjs/xchain-avax', () => {
  describe('Module Exports', () => {
    let moduleExports: any

    beforeAll(() => {
      moduleExports = require('../src/index')
    })

    describe('Named Exports', () => {
      it('should export ClientKeystore', () => {
        expect(moduleExports.ClientKeystore).toBeDefined()
      })
      it('should export ClientLedger', () => {
        expect(moduleExports.ClientLedger).toBeDefined()
      })
    })
    describe('Client Exports', () => {
      it('should export ClientKeystore class', () => {
        expect(moduleExports.ClientKeystore).toBeDefined()
        expect(typeof moduleExports.ClientKeystore).toBe('function')
      })
      it('should export ClientKeystore class', () => {
        expect(moduleExports.ClientKeystore).toBeDefined()
        expect(typeof moduleExports.ClientKeystore).toBe('function')
      })
      it('should export ClientLedger class', () => {
        expect(moduleExports.ClientLedger).toBeDefined()
        expect(typeof moduleExports.ClientLedger).toBe('function')
      })
    })
    describe('Default Export', () => {
      it('should export default ClientKeystore', () => {
        expect(moduleExports.default).toBeDefined()
      })
    })
    describe('Network Configuration', () => {
      it('should support standard networks', () => {
        const { Network } = require('@xchainjs/xchain-client')
        expect(Network.Mainnet).toBe('mainnet')
        expect(Network.Testnet).toBe('testnet')
        expect(Network.Stagenet).toBe('stagenet')
      })
    })
    describe('Package Structure', () => {
      it('should have valid package configuration', () => {
        const pkg = require('../package.json')
        expect(pkg.name).toBe('@xchainjs/xchain-avax')
        expect(pkg.version).toBeDefined()
      })
    })
  })
})
