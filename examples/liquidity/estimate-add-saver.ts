import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { EstimateAddSaver, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

function printSaver(saver: EstimateAddSaver) {
  const expanded = {
    assetAmount: saver.assetAmount.formatedAssetString(),
    estimatedDepositValue: saver.estimatedDepositValue.formatedAssetString(),
    fee: {
      affiliateFee: saver.fee.affiliate.formatedAssetString(),
      asset: saver.fee.asset,
      outbound: saver.fee.outbound.formatedAssetString(),
    },
    expiry: saver.expiry,
    toAddress: saver.toAddress,
    memo: saver.memo,
    estimateWaitTime: saver.estimatedWaitTime,
    saverCapFilledPercent: saver.saverCapFilledPercent,
    slipBasisPoints: saver.slipBasisPoints,
    canAdd: saver.canAddSaver,
    errors: saver.errors,
  }
  console.log(expanded)
}

/**
 * Estimate add saver function
 * Returns estimate saver object
 */
const estimateAddSaver = async () => {
  try {
    const network = process.argv[2] as Network
    const midgardCache = new MidgardCache(new Midgard(network))
    const thorchainCacheMainnet = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
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
