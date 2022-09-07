import { Network } from '@xchainjs/xchain-client'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  CryptoAmount,
  Midgard,
  SwapEstimate,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
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
 * From asset to asset with no Affiliate address on testnet
 */
const doSingleSwap = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const amount = process.argv[4]
    const fromAsset = assetFromString(`${process.argv[5]}`)
    const toAsset = assetFromString(`${process.argv[6]}`)

    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount)), fromAsset),
      destinationAsset: toAsset,
      slipLimit: new BigNumber('0.03'), //optional
    }

    const outPutCanSwap = await tcAmm.estimateSwap(swapParams)
    print(outPutCanSwap.txEstimate, swapParams.input)
    if (outPutCanSwap.txEstimate.canSwap) {
      const output = await tcAmm.doSwap(wallet, swapParams, wallet.clients[toAsset.chain].getAddress())
      console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
    }
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const seed = process.argv[2]
  const network = process.argv[3] as Network
  const thorchainCacheMainnet = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
  const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
  const mainetThorchainAmm = new ThorchainAMM(thorchainQueryMainnet)
  const wallet = new Wallet(seed, thorchainQueryMainnet)
  console.log(`\ Swap on ${network} :)\n`)
  await doSingleSwap(mainetThorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
