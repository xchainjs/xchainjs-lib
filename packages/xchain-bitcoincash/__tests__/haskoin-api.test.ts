import mockHaskoinApi from '../__mocks__/haskoin'
import * as haskoin from '../src/haskoin-api'

describe('Haskoin API Test', () => {
  beforeEach(() => {
    mockHaskoinApi.init()
  })
  afterEach(() => {
    mockHaskoinApi.restore()
  })

  it('broadcastTx', async () => {
    const txHash = await haskoin.broadcastTx({
      txHex: '0xdead',
      haskoinUrl: 'haskoin.com',
    })
    expect(txHash).toEqual('mock-txid-haskoin')
  })
})
