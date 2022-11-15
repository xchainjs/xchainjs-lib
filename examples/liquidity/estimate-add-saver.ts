import { Network } from '@xchainjs/xchain-client'
import {
  CryptoAmount,
  EstimateAddSaver,
  Midgard,
  SaversPosition,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

function printSaver(saver: EstimateAddSaver) {
  const expanded = {
    assetAmount: saver.assetAmount.formatedAssetString(),
    fee: {
      affiliateFee: saver.fee.affiliate.formatedAssetString(),
      asset: saver.fee.asset,
      outbound: saver.fee.outbound.formatedAssetString(),
    },
    expiry: saver.expiry,
    toAddress: saver.toAddress,
    memo: saver.memo,
    estimateWaitTime: saver.estimatedWaitTime,
    canAdd: saver.canAddSaver,
    errors: saver.errors,
  }
  console.log(expanded)
}
// function printSaversPosition(saver: SaversPosition) {
//   const expanded = {
//     depositValue: saver.depositValue.formatedAssetString(),
//     redeemableValue: saver.redeemableValue.formatedAssetString(),
//     lastAddHeight: saver.lastAddHeight,
//     growth: saver.growth,
//     age: saver.age,
//   }
//   console.log(expanded)
// }
/**
 * Estimate add lp function
 * Returns estimate swap object
 */
const estimateAddSaver = async () => {
  try {
    const network = process.argv[2] as Network
    const thorchainCacheMainnet = new ThorchainCache(new Midgard(network), new Thornode(network))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

    const asset = new CryptoAmount(
      assetToBase(assetAmount(process.argv[3], Number(process.argv[4]))),
      assetFromStringEx(process.argv[5]),
    )

    const estimate = await thorchainQueryMainnet.estimateAddSaver(asset)
    printSaver(estimate)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  await estimateAddSaver()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
