import { ThorchainAMM } from '../src/thorchain-amm'

describe('ThorchainAmm e2e tests', () => {
  describe('Thorname', () => {
    let thorchainAmm: ThorchainAMM
    beforeAll(() => {
      thorchainAmm = new ThorchainAMM()
    })

    it(`Should get all thornames by address`, async () => {
      const thornames = await thorchainAmm.getThornamesByAddress('0xc50531811f3d8161a2b53349974ae4c7c6d3bfba')
      console.log('thornames', thornames)
    })
  })
})
