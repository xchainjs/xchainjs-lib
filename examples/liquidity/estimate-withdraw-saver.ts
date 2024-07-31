import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import {
  EstimateWithdrawSaver,
  SaversWithdraw,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { Asset, TokenAsset, assetFromStringEx, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

function printWithdrawSaver(saver: EstimateWithdrawSaver) {
  const expanded = {
    assetAmount: saver.expectedAssetAmount.formatedAssetString(),
    dustAmount: saver.dustAmount.formatedAssetString(),
    dustThreshold: saver.dustThreshold.formatedAssetString(),
    fee: {
      affiliate: saver.fee.affiliate.formatedAssetString(),
      asset: saver.fee.asset,
      outbound: saver.fee.outbound.formatedAssetString(),
    },
    expiry: saver.expiry,
    toAddress: saver.toAddress,
    memo: saver.memo,
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
    const midgardCache = new MidgardCache(new Midgard(network))
    const thorchainCacheMainnet = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
    const asset = assetFromStringEx(process.argv[4]) as Asset | TokenAsset
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
