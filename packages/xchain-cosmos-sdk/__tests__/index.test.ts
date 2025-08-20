describe('@xchainjs/xchain-cosmos-sdk', () => {
  describe('Module Exports', () => {
    let moduleExports: any

    beforeAll(() => {
      moduleExports = require('../src/index')
    })

    describe('Named Exports', () => {
      it('should export base64ToBech32', () => {
        expect(moduleExports.base64ToBech32).toBeDefined()
      })
      it('should export bech32ToBase64', () => {
        expect(moduleExports.bech32ToBase64).toBeDefined()
      })
      it('should export makeClientPath', () => {
        expect(moduleExports.makeClientPath).toBeDefined()
      })
    })
    describe('Client Exports', () => {
      it('should export makeClientPath class', () => {
        expect(moduleExports.makeClientPath).toBeDefined()
        expect(typeof moduleExports.makeClientPath).toBe('function')
      })
    })
    describe('Package Structure', () => {
      it('should have valid package configuration', () => {
        const pkg = require('../package.json')
        expect(pkg.name).toBe('@xchainjs/xchain-cosmos-sdk')
        expect(pkg.version).toBeDefined()
      })
    })
  })
})
