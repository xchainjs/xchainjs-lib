import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { defaultDashParams } from '../src/client'
import { ClientKeystore as Client } from '../src/clientKeystore'
import { AssetDASH } from '../src/const'

const dashClient = new Client({
  ...defaultDashParams,
})

const dashClientTestnet = new Client({
  ...defaultDashParams,
  network: Network.Testnet,
  phrase: process.env.TESTNET_PHRASE,
})

describe('Dash Integration Tests', () => {
  it('should fetch address balance', async () => {
    const balances = await dashClient.getBalance('XmZQkfLtk3xLtbBMenTdaZMxsUBYAsRz1o')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch testnet address balance', async () => {
    const address = await dashClientTestnet.getAddressAsync()
    console.log(address)
    const bal = await dashClientTestnet.getBalance(address)
    bal.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
  })
  it('should fetch previous transactions', async () => {
    let txHistory = await dashClient.getTransactions({
      address: 'XhW237upJdjgYp73mVHSomAE8ckQgHQ8YN',
      offset: 0,
      limit: 10,
    })
    expect(txHistory.total).toBeGreaterThanOrEqual(109)

    txHistory = await dashClient.getTransactions({
      address: 'XhW237upJdjgYp73mVHSomAE8ckQgHQ8YN',
      offset: 5,
      limit: 1,
    })
    expect(txHistory.total).toBeGreaterThanOrEqual(109)

    const address = 'XhW237upJdjgYp73mVHSomAE8ckQgHQ8YN'
    txHistory = await dashClient.getTransactions({ address, offset: 5, limit: 1 })
    expect(txHistory.total).toBe(121)
    expect(txHistory.txs[0].asset).toEqual(AssetDASH)
    expect(txHistory.txs[0].hash).toEqual('8c674426c58a856d085a57c32078268ac129ed7b72104b5a5f1e6579e768d25f')
    expect(txHistory.txs[0].type).toEqual('transfer')

    txHistory = await dashClient.getTransactions({ address, offset: 50000, limit: 10 })
    expect(txHistory.total).toBe(121)

    txHistory = await dashClient.getTransactions({ address, offset: 0, limit: 40 })
    expect(txHistory.txs.length).toBe(40)
  })
  it('should fetch Dash tx data', async () => {
    const txId = '5e84ee1535c06301d3b77b2ea636346ff7c9f0e8f7d6cad353eb6af43dafe826'
    const tx = await dashClient.getTransactionData(txId)
    expect(tx.hash).toBe(txId)
  })
  it('should send a testnet dash tx', async () => {
    try {
      // const from = dashClientTestnet.getAddress(0)
      const to = await dashClientTestnet.getAddressAsync(1)
      const amount = assetToBase(assetAmount('0.0001'))
      const txid = await dashClientTestnet.transfer({
        asset: AssetDASH,
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
      const from = await dashClientTestnet.getAddressAsync(0)
      const to = await dashClientTestnet.getAddressAsync(1)
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await dashClientTestnet.prepareTx({
        asset: AssetDASH,
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
  it('should get fees', async () => {
    try {
      const fees = await dashClient.getFees()
      console.log({
        type: fees.type,
        average: {
          amount: fees.average.amount().toString(),
          decimals: fees.average.decimal,
        },
        fast: {
          amount: fees.fast.amount().toString(),
          decimals: fees.fast.decimal,
        },
        fastest: {
          amount: fees.fastest.amount().toString(),
          decimals: fees.fastest.decimal,
        },
      })
    } catch (error) {
      console.error(`Should get fees". ${error}`)
      fail()
    }
  })
  it('should get fee rates', async () => {
    try {
      const feeRates = await dashClient.getFeeRates()
      console.log(feeRates)
    } catch (error) {
      console.error(`Should get fees". ${error}`)
      fail()
    }
  })
})
