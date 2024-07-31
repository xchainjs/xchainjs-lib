import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain'
import {
  AddliquidityPosition,
  EstimateAddLP,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import {
  Asset,
  AssetCryptoAmount,
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  register9Rheader,
} from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

function print(estimate: EstimateAddLP, rune: AssetCryptoAmount, asset: CryptoAmount<Asset | TokenAsset>) {
  const expanded = {
    rune: rune.formatedAssetString(),
    asset: asset.formatedAssetString(),
    slipPercent: estimate.slipPercent.toFixed(4),
    lpUnits: estimate.lpUnits.amount().toFixed(0),
    runeToAssetRatio: estimate.runeToAssetRatio.toFixed(8),
    transactionFee: {
      assetFee: estimate.inbound.fees.asset.formatedAssetString(),
      runeFee: estimate.inbound.fees.rune.formatedAssetString(),
      totalFees: estimate.inbound.fees.total.formatedAssetString(),
    },
    estimatedWaitSeconds: estimate.estimatedWaitSeconds,
    errors: estimate.errors,
    canAdd: estimate.canAdd,
  }
  console.log(expanded)
}
/**
 * Estimate add lp function
 * Returns estimate swap object
 */
const estimateAddLp = async () => {
  try {
    const network = process.argv[2] as Network
    const midgardCache = new MidgardCache(new Midgard(network))
    const thorchainCacheMainnet = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

    // TODO check if synth?
    const rune = new AssetCryptoAmount(
      assetToBase(assetAmount(process.argv[3])),
      assetFromStringEx(process.argv[4]) as Asset,
    )
    if (!isAssetRuneNative(rune.asset)) {
      throw Error('THOR.RUNE  must be the first argument')
    }
    const asset = new CryptoAmount(
      assetToBase(assetAmount(process.argv[5], Number(process.argv[6]))),
      assetFromStringEx(process.argv[7]) as Asset | TokenAsset,
    )
    // const rune =
    const addLpParams: AddliquidityPosition = {
      asset,
      rune,
    }
    const estimate = await thorchainQueryMainnet.estimateAddLP(addLpParams)
    print(estimate, rune, asset)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  await estimateAddLp()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
