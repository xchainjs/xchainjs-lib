import { Network } from '@xchainjs/xchain-client'
import {
  EstimateWithdrawSaver,
  Midgard,
  SaversWithdraw,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetFromStringEx } from '@xchainjs/xchain-util'

function printWithdrawSaver(saver: EstimateWithdrawSaver) {
  const expanded = {
    assetAmount: saver.expectedAssetAmount.formatedAssetString(),
    fee: {
      affiliate: saver.fee.affiliate.formatedAssetString(),
      asset: saver.fee.asset,
      outbound: saver.fee.outbound.formatedAssetString(),
    },
    expiry: saver.expiry,
    toAddress: saver.toAddress,
    memo: saver.memo,
    estimateWaitTime: saver.estimatedWaitTime,
    slipBasisPoints: saver.slipBasisPoints,
  }
  console.log(expanded)
}

/**
 * Estimate withdraw function
 * Returns estimate withdraw object
 */
const estimateWithdrawSaver = async () => {
  try {
    const network = process.argv[2] as Network
    const thorchainCacheMainnet = new ThorchainCache(new Midgard(network), new Thornode(network))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
    const asset = assetFromStringEx(process.argv[4])
    const withdrawPos: SaversWithdraw = {
      address: process.argv[3],
      asset: asset,
      withdrawBps: Number(process.argv[5]),
    }

    const estimate = await thorchainQueryMainnet.estimateWithdrawSaver(withdrawPos)
    printWithdrawSaver(estimate)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  await estimateWithdrawSaver()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
