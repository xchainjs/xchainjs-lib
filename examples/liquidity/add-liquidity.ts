import { Network } from '@xchainjs/xchain-client'
import {
  AddliquidityPosition,
  CryptoAmount,
  EstimateAddLP,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromString, assetToBase, isAssetRuneNative } from '@xchainjs/xchain-util'

function print(estimate: EstimateAddLP, input1: CryptoAmount, input2: CryptoAmount) {
  const expanded = {
    input1: input1.formatedAssetString(),
    input2: input2.formatedAssetString(),
    slipPercent: estimate.slipPercent.toFixed(4),
    lpUnits: estimate.lpUnits.amount().toFixed(0),
    runeToAssetRatio: estimate.runeToAssetRatio.toFixed(8),
    transactionFee: {
      assetFee: estimate.transactionFee.assetFee.formatedAssetString(),
      runeFee: estimate.transactionFee.runeFee.formatedAssetString(),
      totalFees: estimate.transactionFee.totalFees.formatedAssetString(),
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
    if (!process.argv[5] && !process.argv[6]) {
      throw Error('You must supply 2 asset & amounts')
    }
    // TODO check if synth?
    const input1 = new CryptoAmount(assetToBase(assetAmount(process.argv[3])), assetFromString(process.argv[4]))
    const input2 = new CryptoAmount(assetToBase(assetAmount(process.argv[5])), assetFromString(process.argv[6]))

    const rune = isAssetRuneNative(input1.asset) ? input1 : input2
    const asset = isAssetRuneNative(input1.asset) ? input2 : input1
    // const rune =
    const addLpParams: AddliquidityPosition = {
      asset,
      rune,
    }
    const estimate = await thorchainQueryMainnet.estimateAddLP(addLpParams)
    print(estimate, input1, input2)
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
