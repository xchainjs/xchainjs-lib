import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import newMockInsightApi from "@xchainjs/xchain-dash/__mocks__/insight-mock";
import * as utils from '../src/utils'

const mock = new MockAdapter(axios)
const mockInsightApi = newMockInsightApi(mock)

describe('Dash Utils Test', () => {
  beforeEach(() => {
    mockInsightApi.init()
  })
  afterEach(() => {
    mockInsightApi.restore()
  })

  it('should return a minimum fee of 1000', () => {
    const fee = utils.getFee(1, 1, Buffer.from('reallysmallopreturn', 'utf8'))
    expect(fee).toEqual(1000)
  })

  it('should calculate fees correctly', () => {
    const fee = utils.getFee(10, 2, Buffer.from('swap:bch.bch:qp3wjpa3tjlj042z2wv7hahsldgwhwy0rq9sywjpyy', 'utf8'))
    expect(fee).toEqual(3246)
  })

  it('should return default fees of a normal tx', async () => {
    const estimates = utils.getDefaultFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  describe('broadcastTx', () => {
    it('returns txHash', async () => {
      const txHex = '0xdead'
      const txHash = await utils.broadcastTx({ txHex, nodeUrl: "https://testnet.dash.thorchain.info" })
      expect(txHash).toEqual('mock-txid-thorchain-node')
    })
  })
})
