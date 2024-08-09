import { TradeAsset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainQuery } from '../src'

describe('Thorchain Query', () => {
  let thorchainQuery: ThorchainQuery

  beforeAll(() => {
    thorchainQuery = new ThorchainQuery()
    mockThornodeApi.init()
  })
  afterAll(() => {
    mockThornodeApi.restore()
  })

  it('Should get trade asset unit', async () => {
    const asset = assetFromStringEx('ETH~ETH') as TradeAsset
    const tradeAssetUnits = await thorchainQuery.getTradeAssetUnits({ asset })
    expect(assetToString(tradeAssetUnits.asset)).toBe('ETH~ETH')
    expect(assetToString(tradeAssetUnits.units.asset)).toBe('ETH~ETH')
    expect(tradeAssetUnits.units.assetAmount.amount().toString()).toBe('1137.95699737')
    expect(tradeAssetUnits.units.assetAmount.decimal).toBe(8)
    expect(assetToString(tradeAssetUnits.depth.asset)).toBe('ETH~ETH')
    expect(tradeAssetUnits.depth.assetAmount.amount().toString()).toBe('1137.95699737')
    expect(tradeAssetUnits.depth.assetAmount.decimal).toBe(8)
  })

  it('Should get trade assets unit', async () => {
    const tradeAssetsUnits = await thorchainQuery.getTradeAssetsUnits()
    expect(assetToString(tradeAssetsUnits[0].asset)).toBe('AVAX~AVAX')
    expect(assetToString(tradeAssetsUnits[0].units.asset)).toBe('AVAX~AVAX')
    expect(tradeAssetsUnits[0].units.assetAmount.amount().toString()).toBe('3289.35026564')
    expect(tradeAssetsUnits[0].units.assetAmount.decimal).toBe(8)
    expect(assetToString(tradeAssetsUnits[0].depth.asset)).toBe('AVAX~AVAX')
    expect(tradeAssetsUnits[0].depth.assetAmount.amount().toString()).toBe('3289.35026564')
    expect(tradeAssetsUnits[0].depth.assetAmount.decimal).toBe(8)
  })

  it('Should get address trade accounts', async () => {
    const accounts = await thorchainQuery.getAddressTradeAccounts({
      address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
    })
    expect(accounts.length).toBe(16)
    expect(accounts.every((account) => account.address === 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55'))
    expect(assetToString(accounts[0].asset)).toBe('AVAX~AVAX')
    expect(assetToString(accounts[0].balance.asset)).toBe('AVAX~AVAX')
    expect(accounts[0].balance.assetAmount.amount().toString()).toBe('476.32915497')
    expect(accounts[0].balance.assetAmount.decimal).toBe(8)
    expect(accounts[0].lastAddHeight).toBe(16949652)
    expect(accounts[0].lastWithdrawHeight).toBe(16949626)

    expect(assetToString(accounts[1].asset)).toBe('AVAX~USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E')
    expect(assetToString(accounts[1].balance.asset)).toBe('AVAX~USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E')
    expect(accounts[1].balance.assetAmount.amount().toString()).toBe('5526.70139895')
    expect(accounts[1].balance.assetAmount.decimal).toBe(8)
    expect(accounts[1].lastAddHeight).toBe(16949518)
    expect(accounts[1].lastWithdrawHeight).toBe(16949396)
  })

  it('Should get trade asset accounts', async () => {
    const accounts = await thorchainQuery.getTradeAssetAccounts({
      asset: assetFromStringEx('BTC~BTC') as TradeAsset,
    })
    expect(accounts.length).toBe(10)
    expect(accounts.every((account) => assetToString(account.asset) === 'BTC~BTC'))

    expect(accounts[0].address).toBe('thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55')
    expect(accounts[0].balance.assetAmount.amount().toString()).toBe('3.59979303')
    expect(accounts[0].balance.assetAmount.decimal).toBe(8)
    expect(accounts[0].lastAddHeight).toBe(16949720)
    expect(accounts[0].lastWithdrawHeight).toBe(16949725)

    expect(accounts[1].address).toBe('thor1547pg8p3tm2cu23sud0vuatpz0pttucvch03ll')
    expect(accounts[1].balance.assetAmount.amount().toString()).toBe('0.0000139')
    expect(accounts[1].balance.assetAmount.decimal).toBe(8)
    expect(accounts[1].lastAddHeight).toBe(16894785)
    expect(accounts[1].lastWithdrawHeight).toBeUndefined()
  })
})
