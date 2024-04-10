import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { defaultBTCParams } from '../src/client'
import { ClientKeystore as Client } from '../src/clientKeystore'
import { AssetBTC, SochainDataProviders } from '../src/const'

export const sochainParams: UtxoClientParams = { ...defaultBTCParams, dataProviders: [SochainDataProviders] }
const btcClient = new Client(sochainParams)

const btcClientTestnet = new Client({
  ...sochainParams,
  network: Network.Testnet,
  phrase: process.env.TESTNET_PHRASE,
})
describe('Bitcoin Integration Sochain Tests', () => {
  it('should fetch address balance', async () => {
    const balances = await btcClient.getBalance('bc1qd8jhw2m64r8lslzkx59h8jf3uhgw56grx5dqcf')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch previous transactions', async () => {
    let txHistory = await btcClient.getTransactions({
      address: '15UWKjrakkZjvAGjJttvAm1o6NsB5VeMb9',
      offset: 0,
      limit: 10,
    })
    expect(txHistory.total).toBe(0)

    txHistory = await btcClient.getTransactions({
      address: '15UWKjrakkZjvAGjJttvAm1o6NsB5VeMb9',
      offset: 5,
      limit: 1,
    })
    expect(txHistory.total).toBe(0)

    const address = 'bc1qd8jhw2m64r8lslzkx59h8jf3uhgw56grx5dqcf'
    txHistory = await btcClient.getTransactions({ address, offset: 5, limit: 1 })
    expect(txHistory.total).toBe(1)
    expect(txHistory.txs[0].asset).toEqual(AssetBTC)
    // expect(txHistory.txs[0].hash).toEqual('a9cadbf0a59bbee3253c30978c00eb587a16c7e41421732968fd9626a7fea8af')
    expect(txHistory.txs[0].type).toEqual('transfer')

    txHistory = await btcClient.getTransactions({ address, offset: 500, limit: 10 })
    expect(txHistory.total).toBe(0)

    txHistory = await btcClient.getTransactions({ address, offset: 0, limit: 40 })
    expect(txHistory.total).toBe(40)

    txHistory = await btcClient.getTransactions({ address, offset: 11, limit: 20 })
    expect(txHistory.total).toBe(20)

    try {
      txHistory = await btcClient.getTransactions({ address, offset: -1, limit: 10 })
      fail()
    } catch (error) {}
    try {
      txHistory = await btcClient.getTransactions({ address, offset: 0, limit: -10 })
      fail()
    } catch (error) {}

    // for (const tx of txHistory.txs) {
    //   console.log(tx.hash, tx.date)
    //   console.log(tx.from[0].from, tx.from[0].amount.amount().toFixed())
    //   console.log(tx.to[0].to, tx.to[0].amount.amount().toFixed())
    //   // console.log(JSON.stringify(txHistory, null, 2))
    // }
  })
  it('should fetch btc tx data', async () => {
    const txId = '3b250bfd61e7f231a22c6e02f9927927ac33e40c8b343716e08fec29c509ab54'
    const tx = await btcClient.getTransactionData(txId)
    //console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe(txId)
  })
  it('should send a testnet btc tx via sochain', async () => {
    try {
      //const from = btcClientTestnet.getAddress(0)
      const to = await btcClientTestnet.getAddressAsync(1)
      console.log(JSON.stringify(to, null, 2))
      const amount = assetToBase(assetAmount('0.00001'))
      const txid = await btcClientTestnet.transfer({
        asset: AssetBTC,
        recipient: to,
        amount,
        memo: 'test',
        feeRate: 1,
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('should prepare transaction', async () => {
    try {
      const from = 'tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp'
      const to = 'tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp'
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await btcClientTestnet.prepareTx({
        sender: from,
        recipient: to,
        amount,
        memo: 'test',
        feeRate: 1,
      })
      console.log(rawUnsignedTransaction)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
