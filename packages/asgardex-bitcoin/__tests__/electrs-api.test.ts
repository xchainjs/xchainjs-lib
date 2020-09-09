require('dotenv').config()
import {
  getAddressUtxos,
  getAddressTxs,
  getTxInfo,
  getFeeEstimates,
  getBlocks,
  getAddressInfo,
  // broadcastTx,
} from '../src/electrs-api'

describe('Electrs API Test', () => {
  const electrsAPI = process.env.ELECTRS_API as string
  const address = process.env.VAULT_BTC as string
  const testTxId = '7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8'
  const hexScript = '6a0e535741503a54484f522e52554e45'

  it('electrsAPI was set', () => {
    expect(electrsAPI).toBeDefined()
  })

  it('getAddressUtxos should return an array of utxos', async () => {
    const uxtos = await getAddressUtxos(electrsAPI, address)
    expect(uxtos).toHaveLength(2)
  })

  it('getAddressTxs should return an array of txs', async () => {
    const txs = await getAddressTxs(electrsAPI, address)
    expect(txs).toHaveLength(2)
    expect(txs[1].txid).toEqual(testTxId)
  })

  it('getTxInfo should return OP_RETURN hex script', async () => {
    const txInfo = await getTxInfo(electrsAPI, testTxId)
    expect(txInfo.vout[1].scriptpubkey).toEqual(hexScript)
  })

  it('getFeeEstimates should return an object of fees', async () => {
    const estimates = await getFeeEstimates(electrsAPI)
    expect(estimates).toHaveProperty('144')
  })

  it('getBlocks should return data from the last 10 blocks', async () => {
    const blocks = await getBlocks(electrsAPI)
    expect(blocks).toHaveLength(10)
    expect(blocks[0].id).toEqual(expect.any(String))
  })

  it('getAddressInfo should return data for an address', async () => {
    const addressInfo = await getAddressInfo(electrsAPI, address)
    expect(addressInfo.chain_stats.funded_txo_sum).toEqual(1690843)
  })

  // it('broadcastTx should broadcast a tx and return a txid', async () => {
  //   const hex = '0200000000010140a9405d9a48dc2fe749701ea5021a3472d5f1a8a4101947cf43af12d44db8720100000000ffffffff03dce6000000000000160014622743d961ef7011074e3a5b2458ad4a18a3a08bbcce1b0000000000160014d9015aa056c9d82149f30f27a37fb5ece45522e00000000000000000106a0e535741503a54484f522e52554e4502483045022100988734f888694060c770b4842709a47e9ba18acd2840bdd4954cabe77893bace02202a9d0cf235016e4886df46cbc9f11248b3415fbb16f7dc0e8f419d3586e53f8c012103fa4661da236a51fa881b0f4c2d69efc96fd09ecb276e36f49ad3377a21a3095500000000'
  //   const txid = await broadcastTx(electrsAPI, hex)
  //   expect(txid).toEqual(expect.any(String))
  // })
})
