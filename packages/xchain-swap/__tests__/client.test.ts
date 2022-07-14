import { Network } from '@xchainjs/xchain-client'
// import { AssetETH, AssetLTC, assetAmount, assetToBase } from '@xchainjs/xchain-util'

// import { ThorchainAMM } from '../src/ThorchainAMM'
// import { EstimateSwapParams, SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'


// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const mainnetMidgard = new Midgard(Network.Mainnet)

describe('Midgard Client Test', () => {
  beforeEach(() => {
    mockMidgardApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
  })

  // Tests for the midgard api
  it(`Should return pools array`, async () => {
    const data = await mainnetMidgard.getPools()
    console.log(JSON.stringify(data))
    expect(data).toBeTruthy()
  })
})
