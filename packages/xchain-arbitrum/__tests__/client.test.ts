describe('@xchainjs/xchain-arbitrum', () => {
  describe('Module Exports', () => {
    let moduleExports: any

    beforeAll(() => {
      moduleExports = require('../src/index')
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
        expect(pkg.name).toBe('@xchainjs/xchain-arbitrum')
        expect(pkg.version).toBeDefined()
      })
    })
  })
})
