import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import {
  QuoteSwapParams,
  SwapEstimate,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  TxDetails,
} from '@xchainjs/xchain-thorchain-query'
import { CryptoAmount, assetAmount, assetFromString, assetToBase, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

// Helper function for printing out the returned object
function print(estimate: SwapEstimate, input: CryptoAmount) {
  const expanded = {
    input: input.formatedAssetString(),
    totalFees: {
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipBasisPoints: estimate.slipBasisPoints.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    inboundConfirmationSeconds: estimate.inboundConfirmationSeconds,
    outboundDelaySeconds: estimate.outboundDelaySeconds,
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
    const toleranceBps = 300 //hardcode slip for now
    const network = process.argv[2] as Network
    const amount = process.argv[3]
    const decimals = Number(process.argv[4])

    const fromAsset = assetFromString(`${process.argv[5]}`)
    const toAsset = assetFromString(`${process.argv[6]}`)
    const toDestinationAddress = `${process.argv[7]}`
    const midgardCache = new MidgardCache(new Midgard(network))
    const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
    const thorchainQuery = new ThorchainQuery(thorchainCache)
    let swapParams: QuoteSwapParams

    if (process.argv[8] === undefined) {
      swapParams = {
        fromAsset,
        destinationAsset: toAsset,
        amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
        destinationAddress: toDestinationAddress,
        toleranceBps,
      }
    } else {
      swapParams = {
        fromAsset,
        destinationAsset: toAsset,
        amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
        destinationAddress: toDestinationAddress,
        toleranceBps,
      }
    }

    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
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
