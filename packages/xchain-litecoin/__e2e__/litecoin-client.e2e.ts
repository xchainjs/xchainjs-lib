import { Network, Protocol } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { ClientKeystore as Client } from '../src/ClientKeystore'
import { defaultLtcParams } from '../src/client'
import { AssetLTC } from '../src/const'

const ltcClient = new Client({
  ...defaultLtcParams,
  network: Network.Mainnet,
  phrase: process.env.MAINNET_PHRASE,
})

describe('Litecoin Integration Tests', () => {
  it('Should get address 0 async', async () => {
    try {
      const address = await ltcClient.getAddressAsync()
      console.log(address)
    } catch (error) {
      console.error(`Error running "Should get address 0 async". ${error}`)
      fail()
    }
  })
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
      const amount = assetToBase(assetAmount('0.01'))
      const txid = await ltcClient.transfer({
        recipient: ltcClient.getAddress(1),
        amount,
        memo: 'test',
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('Should fetch fee rates from provider', async () => {
    try {
      const feeRates = await ltcClient.getFeeRates()
      console.log(feeRates)
    } catch (error) {
      console.error(`Error running "Should fetch fee rates from provider". ${error}`)
      fail()
    }
  })
  it('Should fetch fee rates from Thorchain', async () => {
    try {
      const feeRates = await ltcClient.getFeeRates(Protocol.THORCHAIN)
      console.log(feeRates)
    } catch (error) {
      console.error(`Error running "Should fetch fee rates from Thorchain". ${error}`)
      fail()
    }
  })
})
