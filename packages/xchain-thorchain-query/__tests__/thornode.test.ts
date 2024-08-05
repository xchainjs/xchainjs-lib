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

  it('Should get Rune pool info', async () => {
    const info = await thornode.getRunePool()
    expect(info.pol.current_deposit).toBe('500000274528557')
    expect(info.pol.pnl).toBe('-20832884695263')
    expect(info.pol.rune_deposited).toBe('1140707852508600')
    expect(info.pol.rune_withdrawn).toBe('640707577980043')
    expect(info.pol.value).toBe('479167389833294')
    expect(info.providers.current_deposit).toBe('82870333858775')
    expect(info.providers.pending_rune).toBe('0')
    expect(info.providers.pending_units).toBe('0')
    expect(info.providers.pnl).toBe('2736312529281')
    expect(info.providers.units).toBe('82549657185151')
    expect(info.providers.value).toBe('85606646388056')
    expect(info.reserve.current_deposit).toBe('417129940669782')
    expect(info.reserve.pnl).toBe('-23569197224544')
    expect(info.reserve.units).toBe('379506800274219')
    expect(info.reserve.value).toBe('393560743445238')
  })

  it('Should get Rune pool provider info', async () => {
    const info = await thornode.getRunePoolProvider('thor1z8kfpfekj08v6jtdvd33w33mut5grhxs767vxg')
    expect(info.rune_address).toBe('thor1z8kfpfekj08v6jtdvd33w33mut5grhxs767vxg')
    expect(info.units).toBe('99209281509')
    expect(info.value).toBe('102878405990')
    expect(info.pnl).toBe('2778405990')
    expect(info.deposit_amount).toBe('100100000000')
    expect(info.withdraw_amount).toBe('0')
    expect(info.last_deposit_height).toBe(17073232)
    expect(info.last_withdraw_height).toBe(0)
  })

  it('Should get all Rune pool providers info', async () => {
    const info = await thornode.getRunePoolProviders()
    expect(info.length).toBe(3)
    expect(info[0].rune_address).toBe('thor1099eqjssupxhaaf9c3glsxvt2j8q4uaf7awayr')
    expect(info[0].units).toBe('83486766394')
    expect(info[0].value).toBe('86588295723')
    expect(info[0].pnl).toBe('1694295723')
    expect(info[0].deposit_amount).toBe('84894000000')
    expect(info[0].withdraw_amount).toBe('0')
    expect(info[0].last_deposit_height).toBe(17087643)
    expect(info[0].last_withdraw_height).toBe(0)
    expect(info[1].rune_address).toBe('thor10mng80qpckfqvsy2r24ntnne3etdratz63pawh')
    expect(info[1].units).toBe('497019269851')
    expect(info[1].value).toBe('515483511661')
    expect(info[1].pnl).toBe('15483511661')
    expect(info[1].deposit_amount).toBe('500000000000')
    expect(info[1].withdraw_amount).toBe('0')
    expect(info[1].last_deposit_height).toBe(17070187)
    expect(info[1].last_withdraw_height).toBe(0)
    expect(info[2].rune_address).toBe('thor10pv8xhkxvsgzuvf9ayzuhn2c8lupv0w0nzmgxs')
    expect(info[2].units).toBe('10812564288')
    expect(info[2].value).toBe('11214250528')
    expect(info[2].pnl).toBe('214250528')
    expect(info[2].deposit_amount).toBe('11000000000')
    expect(info[2].withdraw_amount).toBe('0')
    expect(info[2].last_deposit_height).toBe(17096088)
    expect(info[2].last_withdraw_height).toBe(0)
  })
})
