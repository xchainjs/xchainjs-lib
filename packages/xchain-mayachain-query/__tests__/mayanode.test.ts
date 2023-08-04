import mockMayanodeApi from '../__mocks__/mayanode-api'
import { Mayanode } from '../src/utils/mayanode'

const mayanode = new Mayanode()
const networkName = 'FullImpLossProtectionBlocks'
const FullImpLossProtectionBlocks = 1440000

describe(`Mayanode transaction status tests`, () => {
  beforeAll(() => {
    mockMayanodeApi.init()
  })
  afterEach(() => {
    mockMayanodeApi.restore()
  })
  const txResp = `276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52`

  it(`Should return thornode txData from hash and match chain btc`, async () => {
    const txStatus = await mayanode.getTxData(txResp)
    expect(txStatus.observed_tx?.tx.chain).toEqual('BTC')
  })

  it(`Should return get scheduled Queue`, async () => {
    const getscheduledQueue = await mayanode.getscheduledQueue()
    expect(getscheduledQueue).toBeTruthy()
    expect(getscheduledQueue[0].chain).toEqual('BNB')
  })

  it(`Should return get last block`, async () => {
    const lastBlock = await mayanode.getLastBlock()
    expect(lastBlock).toBeTruthy()
    expect(lastBlock[0].chain).toEqual('BCH')
  })
  it(`Should return networkValue by name`, async () => {
    const networkValues = await mayanode.getNetworkValues()
    const val = networkValues[networkName.toUpperCase()]
    expect(val).toBeTruthy()
    expect(val).toEqual(FullImpLossProtectionBlocks)
  })
  it(`Should fetch schedule outbound array`, async () => {
    const scheduledOutbound = await mayanode.getscheduledQueue()
    expect(scheduledOutbound).toBeTruthy()
  })
})
