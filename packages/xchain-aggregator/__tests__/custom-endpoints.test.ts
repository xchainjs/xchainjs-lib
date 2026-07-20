import { ThorchainProtocol } from '../src/protocols/thorchain'
import { MayachainProtocol } from '../src/protocols/mayachain'

// The AMM constructors are not relevant for these tests and are mocked away so that
// building a protocol does not pull in unrelated behaviour.
jest.mock('@xchainjs/xchain-thorchain-amm')
jest.mock('@xchainjs/xchain-mayachain-amm')

describe('Custom THORNode/Midgard endpoint configuration', () => {
  describe('Thorchain protocol', () => {
    it('Should forward custom thornode and midgard configs to the underlying clients', () => {
      const thornodeBaseUrls = ['https://my-gateway.example.com/thorchain_api']
      const midgardBaseUrls = ['https://my-gateway.example.com/thorchain_midgard']

      const protocol = new ThorchainProtocol({
        thornodeConfig: { apiRetries: 3, thornodeBaseUrls },
        midgardConfig: { apiRetries: 3, midgardBaseUrls },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cache = (protocol as any).thorchainQuery.thorchainCache
      expect(cache.thornode.config.thornodeBaseUrls).toEqual(thornodeBaseUrls)
      expect(cache.midgardQuery.midgardCache.midgard.config.midgardBaseUrls).toEqual(midgardBaseUrls)
    })

    it('Should keep default endpoints when no custom config is provided', () => {
      const protocol = new ThorchainProtocol()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cache = (protocol as any).thorchainQuery.thorchainCache
      expect(cache.thornode.config.thornodeBaseUrls).toContain('https://thornode.thorchain.network')
      expect(cache.midgardQuery.midgardCache.midgard.config.midgardBaseUrls).toContain(
        'https://midgard.thorchain.network',
      )
    })
  })

  describe('Mayachain protocol', () => {
    it('Should forward custom mayanode and midgard configs to the underlying clients', () => {
      const mayanodeBaseUrls = ['https://my-gateway.example.com/mayanode']
      const midgardBaseUrls = ['https://my-gateway.example.com/maya_midgard']

      const protocol = new MayachainProtocol({
        mayanodeConfig: { apiRetries: 3, mayanodeBaseUrls },
        mayaMidgardConfig: { apiRetries: 3, midgardBaseUrls },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cache = (protocol as any).mayachainQuery.getMayachainCache()
      expect(cache.mayanode.config.mayanodeBaseUrls).toEqual(mayanodeBaseUrls)
      expect(cache.midgardQuery.midgardCache.midgardApi.config.midgardBaseUrls).toEqual(midgardBaseUrls)
    })

    it('Should keep default endpoints when no custom config is provided', () => {
      const protocol = new MayachainProtocol()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cache = (protocol as any).mayachainQuery.getMayachainCache()
      expect(cache.mayanode.config.mayanodeBaseUrls).toContain('https://mayanode.mayachain.info')
      expect(cache.midgardQuery.midgardCache.midgardApi.config.midgardBaseUrls).toContain(
        'https://midgard.mayachain.info',
      )
    })
  })
})
