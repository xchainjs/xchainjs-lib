import { assetToString } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainQuery } from '../src'

describe('Thorchain query', () => {
  describe('Savers', () => {
    let thorchainQuery: ThorchainQuery

    beforeAll(() => {
      thorchainQuery = new ThorchainQuery()
      mockMidgardApi.init()
      mockThornodeApi.init()
    })
    afterAll(() => {
      mockMidgardApi.restore()
      mockThornodeApi.restore()
    })

    it('List savers vaults', async () => {
      const vaults = await thorchainQuery.listSaverVaults()
      expect(vaults.length).toBe(11)
      expect(assetToString(vaults[0].asset)).toBe('AVAX.AVAX')
      expect(vaults[0].isEnabled).toBeTruthy()
      expect(vaults[0].apr).toBe(0.048445694045141235)
      expect(vaults[0].fillBps).toBe(2116)
    })
  })
})
