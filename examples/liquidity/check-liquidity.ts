import { Network } from '@xchainjs/xchain-client'
import { LiquidityPosition, Midgard, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { assetFromString } from '@xchainjs/xchain-util'

function print(estimate: LiquidityPosition, address: string) {
  const expanded = {
    address,
    position: estimate.position,
    poolShare: {
      assetShare: estimate.poolShare.assetShare.formatedAssetString(),
      runeShare: estimate.poolShare.runeShare.formatedAssetString(),
    },
    lpGrowth: estimate.lpGrowth,
    impermanentLossProtection: {
      ILProtection: estimate.impermanentLossProtection.ILProtection.formatedAssetString(),
      totalDays: estimate.impermanentLossProtection.totalDays,
    },
  }
  console.log(expanded)
}
/**
 * checkLiquidityPosition
 */
const checkLiquidityPosition = async () => {
  try {
    const network = process.argv[2] as Network
    const thorchainCacheMainnet = new ThorchainCache(new Midgard(network), new Thornode(network))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

    const asset = assetFromString(process.argv[3])
    const address = process.argv[4] || ''

    const lp = await thorchainQueryMainnet.checkLiquidityPosition(asset, address)
    print(lp, address)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  await checkLiquidityPosition()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
