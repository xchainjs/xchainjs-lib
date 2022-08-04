import { Network } from '@xchainjs/xchain-client'
import { CryptoAmount, EstimateSwapParams, Midgard, SwapEstimate, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { AssetRuneNative, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

// Asset declaration
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('Asset is incorrect')

// Instantiate the classes needed
const midgard = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgard)

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
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('1')), BUSD),
      destinationAsset: AssetRuneNative,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)

    // convert fees (by default returned in RUNE) to a different asset (BUSD)
    const estimateInBusd = await thorchainAmm.getFeesIn(estimate.totalFees, BUSD)
    estimate.totalFees = estimateInBusd
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
