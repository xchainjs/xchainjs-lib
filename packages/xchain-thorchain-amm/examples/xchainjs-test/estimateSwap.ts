import { Network } from '@xchainjs/xchain-client'
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  SwapEstimate,
  ThorchainAMM,
  ThorchainCache,
} from '@xchainjs/xchain-thorchain-amm'
import { assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

// Helper function for printing out the returned object
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

/**
 * Estimate swap function
 * Returns estimate swap object
 */
const estimateSwap = async () => {
  try {
    const network = process.argv[2] as Network
    const amount = process.argv[3]
    const fromAsset = assetFromString(`${process.argv[4]}`)
    const toAsset = assetFromString(`${process.argv[5]}`)
    const midgard = new Midgard(network)
    const cache = new ThorchainCache(midgard)
    const thorchainAmm = new ThorchainAMM(cache)

    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount)), fromAsset),
      destinationAsset: toAsset,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)
    const estimateInFromAsset = await thorchainAmm.getFeesIn(estimate.totalFees, fromAsset)
    estimate.totalFees = estimateInFromAsset
    print(estimate, swapParams.input)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  await estimateSwap()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
