import { Network } from '@xchainjs/xchain-client'
// import { AssetETH, AssetLTC, assetAmount, assetToBase } from '@xchainjs/xchain-util'

// import { ThorchainAMM } from '../src/ThorchainAMM'
// import { EstimateSwapParams, SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const mainnetMidgard = new Midgard(Network.Mainnet)
//const testnetMidgard = new Midgard(Network.Testnet)
//const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
//const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)

// function print(estimate: SwapEstimate) {
//   const expanded = {
//     totalFees: {
//       inboundFee: estimate.totalFees.inboundFee.amount().toFixed(),
//       swapFee: estimate.totalFees.swapFee.amount().toFixed(),
//       outboundFee: estimate.totalFees.outboundFee.amount().toFixed(),
//       affiliateFee: estimate.totalFees.affiliateFee.amount().toFixed(),
//     },
//     slipPercentage: estimate.slipPercentage.toFixed(),
//     netOutput: estimate.netOutput.amount().toFixed(),
//     waitTime: estimate.waitTime.toFixed(),
//     canSwap: estimate.canSwap,
//     errors: estimate.errors,
//   }
//   console.log(expanded)
// }

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
