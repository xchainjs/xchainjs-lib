import mockThornodeApi from '../__mocks__/thornode-api'
import { Thornode } from '../src/utils/thornode'

const thornode = new Thornode()
const networkName = 'FullImpLossProtectionBlocks'
const FullImpLossProtectionBlocks = 1440000

describe(`Thornode transaction status tests`, () => {
  beforeAll(() => {
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockThornodeApi.restore()
  })
  const txResp = `276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52`

  it(`Should return thornode txData from hash and match chain btc`, async () => {
    const txStatus = await thornode.getTxData(txResp)
    expect(txStatus.observed_tx?.tx.chain).toEqual('BTC')
  })

  it(`Should return get scheduled Queue`, async () => {
    const getscheduledQueue = await thornode.getscheduledQueue()
    expect(getscheduledQueue).toBeTruthy()
    expect(getscheduledQueue[0].chain).toEqual('BNB')
  })

  it(`Should return get last block`, async () => {
    const lastBlock = await thornode.getLastBlock()
    expect(lastBlock).toBeTruthy()
    expect(lastBlock[0].chain).toEqual('BCH')
  })

  it(`Should return networkValue by name`, async () => {
    const networkValues = await thornode.getNetworkValues()
    const val = networkValues[networkName.toUpperCase()]
    expect(val).toBeTruthy()
    expect(val).toEqual(FullImpLossProtectionBlocks)
  })

  it(`Should fetch schedule outbound array`, async () => {
    const scheduledOutbound = await thornode.getscheduledQueue()
    expect(scheduledOutbound).toBeTruthy()
  })

  it('Should get trade asset unit', async () => {
    const asset = 'ETH~ETH'
    const tradeAssetUnits = await thornode.getTradeAssetUnits(asset)
    expect(tradeAssetUnits.asset).toBe(asset)
    expect(tradeAssetUnits.units).toBe('113795699737')
    expect(tradeAssetUnits.depth).toBe('113795699737')
  })

  it('Should get trade assets units', async () => {
    const tradeAssetUnits = await thornode.getTradeAssetsUnits()
    expect(tradeAssetUnits.every((traseAssetUnit) => traseAssetUnit.asset.includes('~')))
    expect(tradeAssetUnits.length).toBe(49)
  })

  it('Should get trade asset account', async () => {
    const address = 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55'
    const tradeAssetAccounts = await thornode.getTradeAssetAccount(address)
    console.log(tradeAssetAccounts.every((tradeAssetAccount) => tradeAssetAccount.owner === address))
    console.log(tradeAssetAccounts.every((tradeAssetAccount) => tradeAssetAccount.asset.includes('~')))
  })

  it('Should get trade asset list of accounts', async () => {
    const asset = 'BTC~BTC'
    const tradeAssetAccounts = await thornode.getTradeAssetAccounts(asset)
    expect(tradeAssetAccounts.every((tradeAssetAccount) => tradeAssetAccount.asset === 'BTC~BTC'))
    expect(tradeAssetAccounts.length).toBe(10)
  })
})
