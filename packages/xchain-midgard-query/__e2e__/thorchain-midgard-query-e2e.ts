import { Network } from '@xchainjs/xchain-client'
import { THORNameDetails } from '@xchainjs/xchain-midgard'

import { MidgardCache } from '../src/midgard-cache'
import { MidgardQuery } from '../src/midgard-query'
import { SaversPosition, getSaver } from '../src/types'
import { AssetATOM, AssetAVAX, AssetBTC } from '../src/utils/const'
import { Midgard } from '../src/utils/midgard'

require('dotenv').config()

const midgardCache = new MidgardCache(new Midgard(Network.Mainnet))
const midgardQuery = new MidgardQuery(midgardCache)

function printSaversPosition(saver: SaversPosition) {
  const expanded = {
    depositValue: saver.depositValue.formatedAssetString(),
    redeemableValue: saver.redeemableValue.formatedAssetString(),
    lastAddHeight: saver.lastAddHeight,
    percentageGrowth: saver.percentageGrowth,
    ageInYears: saver.ageInYears,
    ageInDays: saver.ageInDays,
    asset: saver.asset,
  }
  console.log(expanded)
}

function printThorname(thorname: THORNameDetails | undefined) {
  const thornameData = {
    entries: thorname?.entries,
    owner: thorname?.owner,
    expire: thorname?.expire,
  }
  console.log(thornameData)
}

describe('Midgard-query liquidity action end to end Tests', () => {
  it(`Should get savers positions at once`, async () => {
    const addressBtc = 'bc1qk75wen2e7zus3ea4j674dyezvdwr7jj3a9qf6q'
    const addressCosmos = 'cosmos1dmffpc3hw9g0lv48u7hzhpcvlplms9evm4ayex'
    const addressAvax = '0x4359b6da2312cc9650cc887217cf6a418e48a551'
    const saverBtc: getSaver = {
      asset: AssetBTC,
      address: addressBtc,
    }
    const saverAtom: getSaver = {
      asset: AssetATOM,
      address: addressCosmos,
    }
    const saverAvax: getSaver = {
      asset: AssetAVAX,
      address: addressAvax,
    }
    const saverInvalid: getSaver = {
      asset: { chain: 'x', symbol: 'x', ticker: 'x', synth: false },
      address: addressAvax,
    }
    const getSavers = await midgardQuery.getSaverPositions([saverAtom, saverBtc, saverAvax, saverInvalid])
    getSavers.forEach((getSaver) => printSaversPosition(getSaver))
  })
  it(`Should get thorname`, async () => {
    const thorname = await midgardQuery.midgardCache.midgard.getTHORNameDetails('gx')
    console.log('thorname', thorname)
    printThorname(thorname)
  })
  it(`Should get thornames by alias address`, async () => {
    const thornames = await midgardQuery.midgardCache.midgard.getTHORNameReverseLookup(
      'bc1qy6hm644lr8ezl37wn0x59fzd5ps4k4hpufw0dp',
    )
    console.log('thornames', thornames)
  })
  it(`Try get thornames by alias address`, async () => {
    const thornames = await midgardQuery.midgardCache.midgard.getTHORNameReverseLookup(
      'thor138yxnksuhm37j9qqcugt3xzh8cykgvmmtgt63u',
    )
    console.log('thornames', thornames)
  })
})
