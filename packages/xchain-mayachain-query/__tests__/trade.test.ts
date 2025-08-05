import { assetFromStringEx, assetToString, TradeAsset } from '@xchainjs/xchain-util'

import mockMayanodeApi from '../__mocks__/mayanode-api'
import mockMayamidgardApi from '../__mocks__/midgard-api'
import { MayachainQuery } from '../src'

describe('MayachainQuery Trade', () => {
  let mayachainQuery: MayachainQuery

  beforeAll(() => {
    mayachainQuery = new MayachainQuery()
  })

  beforeEach(() => {
    mockMayanodeApi.init()
    mockMayamidgardApi.init()
  })

  afterEach(() => {
    mockMayanodeApi.restore()
    mockMayamidgardApi.restore()
  })

  it('Should get trade asset unit', async () => {
    const asset = assetFromStringEx('ETH~ETH') as TradeAsset
    const tradeAssetUnits = await mayachainQuery.getTradeAssetUnits({ asset })
    expect(assetToString(tradeAssetUnits.asset)).toBe('ETH~ETH')
    expect(assetToString(tradeAssetUnits.units.asset)).toBe('ETH~ETH')
    expect(tradeAssetUnits.units.assetAmount.amount().toString()).toBe('1137.95699737')
    expect(tradeAssetUnits.units.assetAmount.decimal).toBe(8)
    expect(assetToString(tradeAssetUnits.depth.asset)).toBe('ETH~ETH')
    expect(tradeAssetUnits.depth.assetAmount.amount().toString()).toBe('1137.95699737')
    expect(tradeAssetUnits.depth.assetAmount.decimal).toBe(8)
  })

  it('Should get trade assets units', async () => {
    const tradeAssetsUnits = await mayachainQuery.getTradeAssetsUnits()
    expect(tradeAssetsUnits.length).toBeGreaterThan(0)
    const firstAsset = tradeAssetsUnits[0]
    expect(assetToString(firstAsset.asset)).toContain('~')
    expect(firstAsset.units.assetAmount.decimal).toBe(8)
    expect(firstAsset.depth.assetAmount.decimal).toBe(8)
  })

  it('Should get address trade accounts', async () => {
    const address = 'maya1qtemwlu9ju3ts3da5l82qejnzdl3xfs3lv7xz4'
    const tradeAccounts = await mayachainQuery.getAddressTradeAccounts({ address })
    expect(tradeAccounts.length).toBeGreaterThan(0)
    const firstAccount = tradeAccounts[0]
    expect(assetToString(firstAccount.asset)).toContain('~')
    expect(firstAccount.owner).toBe(address)
    expect(firstAccount.units.assetAmount.decimal).toBe(8)
  })

  it('Should get trade asset accounts', async () => {
    const asset = assetFromStringEx('ETH~ETH') as TradeAsset
    const tradeAccounts = await mayachainQuery.getTradeAssetAccounts({ asset })
    expect(tradeAccounts.length).toBeGreaterThan(0)
    const firstAccount = tradeAccounts[0]
    expect(assetToString(firstAccount.asset)).toBe('ETH~ETH')
    expect(firstAccount.owner).toBeTruthy()
    expect(firstAccount.units.assetAmount.decimal).toBe(8)
  })
})
