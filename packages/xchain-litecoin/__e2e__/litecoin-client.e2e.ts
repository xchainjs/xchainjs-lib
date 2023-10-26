import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { Client } from '../src/client'
import { AssetLTC } from '../src/const'

const ltcClient = new Client()

describe('Litecoin Integration Tests', () => {
  it('should fetch address balance', async () => {
    const balances = await ltcClient.getBalance('MRK2xhgBiNpGLkMTNBmTE4yzMiRJPLkGqP')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch previous transactions', async () => {
    let txHistory = await ltcClient.getTransactions({
      address: 'LQZKEsJWXu6892brV3vJQb2EEKqQnYUFDq',
      offset: 0,
      limit: 10,
    })
    expect(txHistory.total).toBe(0)

    txHistory = await ltcClient.getTransactions({
      address: 'LQZKEsJWXu6892brV3vJQb2EEKqQnYUFDq',
      offset: 5,
      limit: 1,
    })
    expect(txHistory.total).toBe(0)

    const address = 'MRK2xhgBiNpGLkMTNBmTE4yzMiRJPLkGqP'
    txHistory = await ltcClient.getTransactions({ address, offset: 5, limit: 1 })
    expect(txHistory.total).toBe(1)
    expect(txHistory.txs[0].asset).toEqual(AssetLTC)
    expect(txHistory.txs[0].hash).toEqual('0f93b895999a93e2ff91fadc53ff6037292263011df44478ce14d8ca72a94c7e')
    expect(txHistory.txs[0].type).toEqual('transfer')

    txHistory = await ltcClient.getTransactions({ address, offset: 50000, limit: 10 })
    expect(txHistory.total).toBe(0)

    txHistory = await ltcClient.getTransactions({ address, offset: 0, limit: 40 })
    expect(txHistory.total).toBe(40)

    txHistory = await ltcClient.getTransactions({ address, offset: 11, limit: 20 })
    expect(txHistory.total).toBe(20)
    expect(txHistory.txs[0].hash).toEqual('1cee349a214267c211f05cccd1bbcef994958496f470ee41f4a7c80375904d4b')
    expect(txHistory.txs[19].hash).toEqual('f374dfcce7baaadf0578a03816d5ab3a390388e38e898c4353d8481b4592a0f8')

    try {
      txHistory = await ltcClient.getTransactions({ address, offset: -1, limit: 10 })
      fail()
    } catch (error) {}
    try {
      txHistory = await ltcClient.getTransactions({ address, offset: 0, limit: -10 })
      fail()
    } catch (error) {}

    expect(txHistory.total).toBeGreaterThan(0)
  })
  it('should fetch ltc tx data', async () => {
    const txId = '91a7a17110081c1f3da4b71d1526e4cb8494b5727521b32b2caf25fb8409619a'
    const tx = await ltcClient.getTransactionData(txId)
    expect(tx.hash).toBe(txId)
  })
  it('should prepare transaction', async () => {
    try {
      const from = 'M9mFmGYW7azHoFvMkYBh3L78YCe1SpwTM4'
      const to = 'M9mFmGYW7azHoFvMkYBh3L78YCe1SpwTM4'
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await ltcClient.prepareTx({
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
  it('should send a LTC transaction', async () => {
    try {
      const amount = assetToBase(assetAmount('0.000011'))
      const txid = await ltcClient.transfer({
        recipient: ltcClient.getAddress(1),
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
  // it('should send a testnet btc tx', async () => {
  //   try {
  //     const ltcClientTestnet = new Client({
  //       haskoinUrl: {
  //         [Network.Testnet]: 'https://api.haskoin.com/btctest',
  //         [Network.Mainnet]: 'https://api.haskoin.com/btc',
  //         [Network.Stagenet]: 'https://api.haskoin.com/btc',
  //       },
  //       network: Network.Testnet,
  //       phrase: process.env.TESTNETPHRASE,
  //       sochainApiKey: process.env.SOCHAIN_API_KEY || '',
  //     })
  //     // const from = ltcClientTestnet.getAddress(0)
  //     const to = ltcClientTestnet.getAddress(1)
  //     const amount = assetToBase(assetAmount('0.0001'))
  //     const txid = await ltcClientTestnet.transfer({
  //       asset: AssetLTC,
  //       recipient: to,
  //       amount,
  //       memo: 'test',
  //       feeRate: 1,
  //     })
  //     console.log(JSON.stringify(txid, null, 2))
  //   } catch (err) {
  //     console.error('ERR running test', err)
  //     fail()
  //   }
  // })
})
