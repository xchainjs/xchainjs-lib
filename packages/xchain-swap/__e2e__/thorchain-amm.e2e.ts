import { Network } from '@xchainjs/xchain-client'
import { AssetBTC, AssetETH, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { ThorchainAMM } from '../src/ThorchainAMM'
import { EstimateSwapParams, SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'

const midgard = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgard)

function print(estimate: SwapEstimate) {
  const expanded = {
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.amount().toFixed(),
      swapFee: estimate.totalFees.swapFee.amount().toFixed(),
      outboundFee: estimate.totalFees.outboundFee.amount().toFixed(),
      affiliateFee: estimate.totalFees.affiliateFee.amount().toFixed(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.amount().toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}
describe('xchain-swap Integration Tests', () => {
  it('should estimate a swap of 1 BTC to ETH', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(1)),
      affiliateFeePercent: 0.03, //optional
      slipLimit: new BigNumber(0.02), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    print(estimate)
  })
})
