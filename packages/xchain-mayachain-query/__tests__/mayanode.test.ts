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
  const txResp = `40CB2D3323F3A68B15B270419A24D3894DC02B56FD6DA73E5560F91B8B1C0FBF`

  it(`Should return mayanode txData from hash and match chain btc`, async () => {
    const txStatus = await mayanode.getTxData(txResp)
    expect(txStatus.observed_tx?.tx.chain).toEqual('MAYA')
  })

  it(`Should return get scheduled Queue`, async () => {
    const getscheduledQueue = await mayanode.getscheduledQueue()
    expect(getscheduledQueue).toBeTruthy()
    expect(getscheduledQueue[0].chain).toEqual('ETH')
  })

  it(`Should return get last block`, async () => {
    const lastBlock = await mayanode.getLastBlock()
    expect(lastBlock).toBeTruthy()
    expect(lastBlock[0].chain).toEqual('BTC')
  })
  // skip due to networkName key not supported in /mimir
  it.skip(`Should return networkValue by name`, async () => {
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
