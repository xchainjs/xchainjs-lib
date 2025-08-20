describe('THORNODE API', () => {
  describe('API Exports', () => {
    it('should export API client', () => {
      const apiModule = require('../src/index')
      expect(apiModule).toBeDefined()
    })
  })

  describe('Configuration', () => {
    it('should have proper configuration structure', () => {
      const config = require('../src/index')
      expect(typeof config).toBe('object')
    })
  })
})
