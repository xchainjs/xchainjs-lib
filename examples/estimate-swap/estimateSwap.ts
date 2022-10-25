import { Network } from '@xchainjs/xchain-client'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  SwapEstimate,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  TxDetails,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

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
  return expanded
}
function printTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: print(txDetails.txEstimate, input),
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
    const decimals = Number(process.argv[4])

    const fromAsset = assetFromString(`${process.argv[5]}`)
    const toAsset = assetFromString(`${process.argv[6]}`)
    const toDestinationAddress = `${process.argv[7]}`
    const thorchainCacheMainnet = new ThorchainCache(new Midgard(network), new Thornode(network))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
    const mainetThorchainAmm = new ThorchainAMM(thorchainQueryMainnet)

    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
      destinationAsset: toAsset,
      destinationAddress: toDestinationAddress,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }
    const estimate = await mainetThorchainAmm.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
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
