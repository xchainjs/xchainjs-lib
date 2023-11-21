import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { Client, defaultDogeParams } from '../src/client'
import { AssetDOGE } from '../src/const'

const dogeClient = new Client({
  ...defaultDogeParams,
  phrase: process.env.MAINNET_PHRASE,
})

describe('Dogecoin Integration Tests', () => {
  it('should fetch address balance', async () => {
    const balances = await dogeClient.getBalance(await dogeClient.getAddressAsync())
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch previous transactions', async () => {
    const address = 'D8ZEVbgf4yPs3MK8dMJJ7PpSyBKsbd66TX'
    const txHistory = await dogeClient.getTransactions({ address })
    for (const tx of txHistory.txs) {
      console.log(tx.hash, tx.date)
      console.log(tx.from[0].from, tx.from[0].amount.amount().toFixed())
      console.log(tx.to[0].to, tx.to[0].amount.amount().toFixed())
      // console.log(JSON.stringify(txHistory, null, 2))
    }

    expect(txHistory.total).toBeGreaterThan(0)
  })
  it('should fetch btc tx data', async () => {
    const txId = '9aad92e74a02d04abc214ed3878521d0b1bb57fda83927e322b72b3553834795'
    const tx = await dogeClient.getTransactionData(txId)
    //console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe(txId)
  })
  it('should fetch previous transactions', async () => {
    let txHistory = await dogeClient.getTransactions({
      address: 'DQxY3rSz6nDqnZjqFtiBZa4ZCRGuqjz4pB',
      offset: 0,
      limit: 10,
    })
    expect(txHistory.total).toBe(0)

    txHistory = await dogeClient.getTransactions({
      address: 'DQxY3rSz6nDqnZjqFtiBZa4ZCRGuqjz4pB',
      offset: 5,
      limit: 1,
    })
    expect(txHistory.total).toBe(0)

    const address = 'DRapidDiBYggT1zdrELnVhNDqyAHn89cRi'
    txHistory = await dogeClient.getTransactions({ address, offset: 5, limit: 1 })
    expect(txHistory.total).toBe(1)
    expect(txHistory.txs[0].asset).toEqual(AssetDOGE)
    expect(txHistory.txs[0].hash).toEqual('c43890d7498c90aac946d6f3d1718aaebdc3d31c397c98695a4ed8b97104a890')
    expect(txHistory.txs[0].type).toEqual('transfer')

    txHistory = await dogeClient.getTransactions({ address, offset: 500000, limit: 10 })
    expect(txHistory.total).toBe(0)

    txHistory = await dogeClient.getTransactions({ address, offset: 11, limit: 20 })
    expect(txHistory.total).toBe(20)
    expect(txHistory.txs[0].hash).toEqual('4b5fa2096de42da32e694c1d4f37eced7b7854a3148344b2441f3b38d3884c58')
    expect(txHistory.txs[19].hash).toEqual('000788abdee9fdb67819e60cc3c60b8f881f6188c06960b98201c08a6bc46278')

    try {
      txHistory = await dogeClient.getTransactions({ address, offset: -1, limit: 10 })
      fail()
    } catch (error) {}
    try {
      txHistory = await dogeClient.getTransactions({ address, offset: 0, limit: -10 })
      fail()
    } catch (error) {}

    // for (const tx of txHistory.txs) {
    //   console.log(tx.hash, tx.date)
    //   console.log(tx.from[0].from, tx.from[0].amount.amount().toFixed())
    //   console.log(tx.to[0].to, tx.to[0].amount.amount().toFixed())
    //   // console.log(JSON.stringify(txHistory, null, 2))
    // }
  })
  it('should prepare transaction', async () => {
    try {
      const from = 'DBfThwN6PMLrwcEfWBNqeqM1wbhdshbr5P'
      const to = 'DBfThwN6PMLrwcEfWBNqeqM1wbhdshbr5P'
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await dogeClient.prepareTx({
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
  it('Should transfer doge tx fron index 0 to index 1', async () => {
    try {
      const dogeclient = new Client({
        ...defaultDogeParams,
        phrase: process.env.MAINNET_PHRASE,
        network: Network.Mainnet,
      })
      const amount = assetToBase(assetAmount('10'))
      const hash = await dogeclient.transfer({
        recipient: dogeclient.getAddress(1),
        amount,
        memo: 'test',
        feeRate: 40_000,
      })
      console.log(hash)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
