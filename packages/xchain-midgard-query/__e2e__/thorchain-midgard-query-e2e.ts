import { Network } from '@xchainjs/xchain-client'
import { THORNameDetails } from '@xchainjs/xchain-midgard'
import { assetFromStringEx } from '@xchainjs/xchain-util'

import { MidgardCache } from '../src/midgard-cache'
import { MidgardQuery } from '../src/midgard-query'
import { AssetATOM, AssetAVAX, AssetBTC } from '../src/utils/const'
import { Midgard } from '../src/utils/midgard'

import 'dotenv/config'

const midgardCache = new MidgardCache(new Midgard(Network.Mainnet))
const midgardQuery = new MidgardQuery(midgardCache)

function printThorname(thorname: THORNameDetails | undefined) {
  const thornameData = {
    entries: thorname?.entries,
    owner: thorname?.owner,
    expire: thorname?.expire,
  }
  console.log(thornameData)
}

describe('Midgard-query liquidity action end to end Tests', () => {
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
  it(`Shoud return decimals by asset`, async () => {
    const atomDecimals = await midgardQuery.getDecimalForAsset(AssetATOM)
    const avaxDecimals = await midgardQuery.getDecimalForAsset(AssetAVAX)
    const btcDecimals = await midgardQuery.getDecimalForAsset(AssetBTC)
    const synthBtcDecimals = await midgardQuery.getDecimalForAsset(assetFromStringEx('BTC/BTC'))
    console.log(`AssetATOM decimals: ${atomDecimals}`)
    console.log(`AssetAVAX decimals: ${avaxDecimals}`)
    console.log(`AssetBTC decimals: ${btcDecimals}`)
    console.log(`Synth AssetBTC decimals: ${synthBtcDecimals}`)
  })
})
