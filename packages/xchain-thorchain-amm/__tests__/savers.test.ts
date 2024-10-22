import { assetToString } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainAMM } from '../src'

describe('ThorchainAMM', () => {
  describe('Rune pool', () => {
    let thorchainAMM: ThorchainAMM

    beforeAll(() => {
      thorchainAMM = new ThorchainAMM()
    })

    beforeAll(() => {
      mockMidgardApi.init()
      mockThornodeApi.init()
    })

    beforeAll(() => {
      mockMidgardApi.restore()
      mockThornodeApi.restore()
    })

    it('List savers vaults', async () => {
      const vaults = await thorchainAMM.listSaverVaults()
      expect(vaults.length).toBe(11)
      expect(assetToString(vaults[0].asset)).toBe('AVAX.AVAX')
      expect(vaults[0].isEnabled).toBeTruthy()
      expect(vaults[0].apr).toBe(0.048445694045141235)
      expect(vaults[0].fillBps).toBe(2116)
    })
  })
})
