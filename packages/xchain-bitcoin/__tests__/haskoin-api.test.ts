import mockHaskoinApi from '../__mocks__/haskoin'
import * as haskoin from '../src/haskoin-api'

mockHaskoinApi.init()

// Mock address has to match with mock file in `__mocks__/response/balances/haskoin-{address}.json
const MOCK_ADDRESS = 'bc1address'

describe('Haskoin API Test', () => {
  it('getBalance', async () => {
    const balance = await haskoin.getBalance(MOCK_ADDRESS)
    expect(balance.amount().toString()).toEqual('3300000')
  })
})
