import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import {
  EstimateWithdrawLP,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import { Asset, TokenAsset, assetFromString, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

function print(estimate: EstimateWithdrawLP, withdrawLpParams: WithdrawLiquidityPosition) {
  const expanded = {
    slipPercent: estimate.slipPercent.toFixed(4),
    runeAmount: estimate.runeAmount.formatedAssetString(),
    assetAmount: estimate.assetAmount.formatedAssetString(),
    inbound: {
      assetFee: estimate.inbound.fees.asset.formatedAssetString(),
      runeFee: estimate.inbound.fees.rune.formatedAssetString(),
      totalFees: estimate.inbound.fees.total.formatedAssetString(),
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
    const midgardCache = new MidgardCache(new Midgard(network))
    const thorchainCacheMainnet = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

    const asset = assetFromString(process.argv[3]) as Asset | TokenAsset
    const percentage = Number(process.argv[4])
    const assetAddress = process.argv[5] || ''
    const runeAddress = process.argv[6] || ''

    const withdrawLpParams: WithdrawLiquidityPosition = {
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
