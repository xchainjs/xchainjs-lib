describe('@xchainjs/xchain-evm-providers', () => {
  describe('Module Exports', () => {
    it('should export main functionality', () => {
      const moduleExports = require('../src/index')
      expect(moduleExports).toBeDefined()
      expect(typeof moduleExports).toBe('object')
    })
  })

  describe('Package Structure', () => {
    it('should have valid package configuration', () => {
      const pkg = require('../package.json')
      expect(pkg.name).toBe('@xchainjs/xchain-evm-providers')
      expect(pkg.version).toBeDefined()
    })
  })
})
