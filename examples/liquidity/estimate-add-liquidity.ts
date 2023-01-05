import { Network } from '@xchainjs/xchain-client'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain'
import {
  AddliquidityPosition,
  CryptoAmount,
  EstimateAddLP,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

function print(estimate: EstimateAddLP, rune: CryptoAmount, asset: CryptoAmount) {
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
    const thorchainCacheMainnet = new ThorchainCache(new Midgard(network), new Thornode(network))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

    // TODO check if synth?
    const rune = new CryptoAmount(assetToBase(assetAmount(process.argv[3])), assetFromStringEx(process.argv[4]))
    if (!isAssetRuneNative(rune.asset)) {
      throw Error('THOR.RUNE  must be the first argument')
    }
    const asset = new CryptoAmount(
      assetToBase(assetAmount(process.argv[5], Number(process.argv[6]))),
      assetFromStringEx(process.argv[7]),
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
