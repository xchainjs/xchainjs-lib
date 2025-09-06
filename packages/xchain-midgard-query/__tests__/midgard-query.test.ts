import { AssetType, assetFromStringEx } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import { MidgardCache } from '../src/midgard-cache'
import { MidgardQuery } from '../src/midgard-query'
import { AssetATOM, AssetAVAX, AssetBTC } from '../src/utils/const'
import { Midgard } from '../src/utils/midgard'

const mainnetMidgard = new Midgard()
const midgardCache = new MidgardCache(mainnetMidgard)

describe('MidgardQuery Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
  })

  it(`Should return default THORChain decimals for RUNE native asset`, async () => {
    const midgardQuery = new MidgardQuery(midgardCache)
    const runeAsset = { chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE', type: AssetType.NATIVE }
    const decimals = await midgardQuery.getDecimalForAsset(runeAsset)
    expect(decimals).toBe(8)
  })

  it(`Should return default THORChain decimals for synth asset`, async () => {
    const midgardQuery = new MidgardQuery(midgardCache)
    const synthAsset = assetFromStringEx('BTC/BTC')
    const decimals = await midgardQuery.getDecimalForAsset(synthAsset)
    expect(decimals).toBe(8)
  })

  it(`Should return default THORChain decimals for trade asset`, async () => {
    const midgardQuery = new MidgardQuery(midgardCache)
    const tradeAsset = assetFromStringEx('BTC~BTC')
    const decimals = await midgardQuery.getDecimalForAsset(tradeAsset)
    expect(decimals).toBe(8)
  })

  it(`Should return default THORChain decimals for secured asset`, async () => {
    const midgardQuery = new MidgardQuery(midgardCache)
    const securedAsset = assetFromStringEx('BTC-BTC')
    const decimals = await midgardQuery.getDecimalForAsset(securedAsset)
    expect(decimals).toBe(8)
  })

  it(`Should return override decimals when provided in constructor`, async () => {
    const overrideDecimals = { 'GAIA.ATOM': 18 }
    const midgardQueryWithOverride = new MidgardQuery(midgardCache, overrideDecimals)

    const decimals = await midgardQueryWithOverride.getDecimalForAsset(AssetATOM)
    expect(decimals).toBe(18)
  })

  it(`Should return pool native decimals when no override is provided`, async () => {
    const midgardQuery = new MidgardQuery(midgardCache)
    const decimals = await midgardQuery.getDecimalForAsset(AssetATOM)
    expect(decimals).toBe(6)
  })

  it(`Should prioritize override decimals over pool decimals`, async () => {
    const overrideDecimals = { 'GAIA.ATOM': 12 }
    const midgardQueryWithOverride = new MidgardQuery(midgardCache, overrideDecimals)

    const decimals = await midgardQueryWithOverride.getDecimalForAsset(AssetATOM)
    expect(decimals).toBe(12)
  })

  it(`Should handle multiple assets with different override decimals`, async () => {
    const overrideDecimals = {
      'GAIA.ATOM': 18,
      'AVAX.AVAX': 12,
      'BTC.BTC': 4,
    }
    const midgardQueryWithOverride = new MidgardQuery(midgardCache, overrideDecimals)

    const atomDecimals = await midgardQueryWithOverride.getDecimalForAsset(AssetATOM)
    const avaxDecimals = await midgardQueryWithOverride.getDecimalForAsset(AssetAVAX)
    const btcDecimals = await midgardQueryWithOverride.getDecimalForAsset(AssetBTC)

    expect(atomDecimals).toBe(18)
    expect(avaxDecimals).toBe(12)
    expect(btcDecimals).toBe(4)
  })
})
