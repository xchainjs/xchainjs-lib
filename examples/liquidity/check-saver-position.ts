import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { SaversPosition, ThorchainCache, ThorchainQuery, Thornode, getSaver } from '@xchainjs/xchain-thorchain-query'
import { assetFromString, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

function printSaversPosition(saver: SaversPosition) {
  const expanded = {
    depositValue: saver.depositValue.formatedAssetString(),
    redeemableValue: saver.redeemableValue.formatedAssetString(),
    lastAddHeight: saver.lastAddHeight,
    percentageGrowth: saver.percentageGrowth,
    ageInYears: saver.ageInYears,
    ageInDays: saver.ageInDays,
  }
  console.log(expanded)
}
/**
 * Check saver position
 */
const getSaverPosition = async () => {
  try {
    const network = process.argv[2] as Network
    const midgardCache = new MidgardCache(new Midgard(network))
    const thorchainCacheMainnet = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
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
