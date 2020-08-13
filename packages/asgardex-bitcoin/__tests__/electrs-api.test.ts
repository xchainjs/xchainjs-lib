require('dotenv').config()
import {
  getAddressUtxos,
  getAddressTxs,
  getTxInfo,
  getFeeEstimates,
  getBlocks,
  getAddressInfo,
} from '../src/electrs-api'

describe('Electrs API Test', () => {
  const electrsAPI = process.env.ELECTRS_API as string
  const address = process.env.VAULT_BTC as string
  const testTxId = '7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8'
  const valueOut = 99000
  const hexScript = '6a0e535741503a54484f522e52554e45'

  it('electrsAPI was set', () => {
    expect(electrsAPI).toBeDefined()
  })

  it('getAddressUtxos should return an array of utxos', async () => {
    const uxtos = await getAddressUtxos(electrsAPI, address)
    expect(uxtos).toHaveLength(1)
    expect(uxtos[0].value).toEqual(valueOut)
  })

  it('getAddressTxs should return an array of txs', async () => {
    const txs = await getAddressTxs(electrsAPI, address)
    expect(txs).toHaveLength(1)
    expect(txs[0].txid).toEqual(testTxId)
  })

  it('getTxInfo should return OP_RETURN hex script', async () => {
    const txInfo = await getTxInfo(electrsAPI, testTxId)
    expect(txInfo.vout[1].scriptpubkey).toEqual(hexScript)
  })

  it('getFeeEstimates should return an object of fees', async () => {
    const estimates = await getFeeEstimates(electrsAPI)
    expect(estimates).toHaveProperty('1')
    expect(estimates).toHaveProperty('2')
    expect(estimates).toHaveProperty('3')
    expect(estimates).toHaveProperty('25')
    expect(estimates).toHaveProperty('144')
  })

  it('getBlocks should return data from the last 10 blocks', async () => {
    const blocks = await getBlocks(electrsAPI)
    expect(blocks).toHaveLength(10)
    expect(blocks[0].id).toEqual(expect.any(String))
  })

  it('getAddressInfo should return data for an address', async () => {
    const addressInfo = await getAddressInfo(electrsAPI, address)
    expect(addressInfo.chain_stats.funded_txo_sum).toEqual(99000)
  })
})
