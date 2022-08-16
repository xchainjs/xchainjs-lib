import { Network } from '@xchainjs/xchain-client'
import { AssetBTC, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { CryptoAmount, EstimateSwapParams, Midgard, SwapEstimate, ThorchainAMM } from '../src/index'
import { ThorchainCache } from '../src/thorchain-cache'

const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')

function print(estimate: SwapEstimate, input: CryptoAmount) {
  const expanded = {
    input: input.formatedAssetString(),
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.formatedAssetString(),
      swapFee: estimate.totalFees.swapFee.formatedAssetString(),
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    waitTimeSeconds: estimate.waitTimeSeconds.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}
describe('xchain-swap temp Tests', () => {
  it(`Should perform a double swap `, async () => {
    try {
      const midgard = new Midgard(Network.Mainnet) //defaults to mainnet
      const thorchainCache = new ThorchainCache(midgard)
      const thorchainAmm = new ThorchainAMM(thorchainCache)
      const swapParams: EstimateSwapParams = {
        input: new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC),
        destinationAsset: BUSD,
        // affiliateFeePercent: 0.003, //optional
        slipLimit: new BigNumber('0.03'), //optional
      }
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate, swapParams.input)

      // convert fees (by defualt returned in RUNE) to a different asset (BUSD)
      const estimateInBusd = await thorchainAmm.getFeesIn(estimate.totalFees, BUSD)
      estimate.totalFees = estimateInBusd
      print(estimate, swapParams.input)
    } catch (e) {
      console.error(e)
    }
  })
})
