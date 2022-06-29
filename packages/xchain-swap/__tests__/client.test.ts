import mockMidgardApi from '../__mocks__/midgard-api'
import { Midgard } from '../src/utils/midgard'
import { Network } from '@xchainjs/xchain-client'
//import { ThorchainAMM } from '../src/ThorchainAMM'

const mainnetMidgard = new Midgard(Network.Mainnet)
//const testnetMidgard = new Midgard(Network.Testnet)
//const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
//const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)

describe('Midgard Client Test', () => {
  beforeEach(() => {
    mockMidgardApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
  })

  it(`Should return pools array`, async () => {
    const data = await mainnetMidgard.getPools()
    console.log(JSON.stringify(data))
    expect(data).toBeTruthy()
  })

})
