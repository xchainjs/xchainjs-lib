import { Network } from '@xchainjs/xchain-client'
import {
  EstimateWithdrawLP,
  Midgard,
  RemoveLiquidityPosition,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetFromString } from '@xchainjs/xchain-util'

function print(estimate: EstimateWithdrawLP, withdrawLpParams: RemoveLiquidityPosition) {
  const expanded = {
    slipPercent: estimate.slipPercent.toFixed(4),
    runeAmount: estimate.runeAmount.formatedAssetString(),
    assetAmount: estimate.assetAmount.formatedAssetString(),
    transactionFee: {
      assetFee: estimate.transactionFee.assetFee.formatedAssetString(),
      runeFee: estimate.transactionFee.runeFee.formatedAssetString(),
      totalFees: estimate.transactionFee.totalFees.formatedAssetString(),
    },
    impermanentLossProtection: {
      ILProtection: estimate.impermanentLossProtection.ILProtection,
      totalDays: estimate.impermanentLossProtection.totalDays,
    },
    estimatedWaitSeconds: estimate.estimatedWaitSeconds,
  }
  console.log(withdrawLpParams)
  console.log(expanded)
}
/**
 * Estimate Withdraw lp function
 * Returns estimate swap object
 */
const estimateWithdrawLp = async () => {
  try {
    const network = process.argv[2] as Network
    const thorchainCacheMainnet = new ThorchainCache(new Midgard(network), new Thornode(network))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

    const asset = assetFromString(process.argv[3])
    const percentage = Number(process.argv[4])
    const assetAddress = process.argv[5] || ''
    const runeAddress = process.argv[6] || ''

    const withdrawLpParams: RemoveLiquidityPosition = {
      asset,
      percentage,
      assetAddress,
      runeAddress,
    }
    const estimate = await thorchainQueryMainnet.estimateWithdrawLP(withdrawLpParams)
    print(estimate, withdrawLpParams)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  await estimateWithdrawLp()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
