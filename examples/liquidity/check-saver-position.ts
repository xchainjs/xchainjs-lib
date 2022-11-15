import { Network } from '@xchainjs/xchain-client'
import {
  Midgard,
  SaversPosition,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  getSaver,
} from '@xchainjs/xchain-thorchain-query'
import { assetFromString } from '@xchainjs/xchain-util'

function printSaversPosition(saver: SaversPosition) {
  const expanded = {
    depositValue: saver.depositValue.formatedAssetString(),
    redeemableValue: saver.redeemableValue.formatedAssetString(),
    lastAddHeight: saver.lastAddHeight,
    growth: saver.growth,
    age: saver.age,
  }
  console.log(expanded)
}
/**
 * Check saver position
 */
const getSaverPosition = async () => {
  try {
    const network = process.argv[2] as Network
    const thorchainCacheMainnet = new ThorchainCache(new Midgard(network), new Thornode(network))
    const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
    const getSaver: getSaver = {
      asset: assetFromString(process.argv[4]),
      address: process.argv[3] || '',
    }

    const saverPos = await thorchainQueryMainnet.getSaverPosition(getSaver)
    printSaversPosition(saverPos)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  await getSaverPosition()
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
