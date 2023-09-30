import { Network, TxParams } from '@xchainjs/xchain-client'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'

import { Client as KujiraClient } from '../src/client'
import { AssetKUJI, KUJIChain } from '../src/const'

let xchainClient: KujiraClient

const AssetTokenKuji = {
  chain: KUJIChain,
  symbol: 'factory/kujira1ltvwg69sw3c5z99c6rr08hal7v0kdzfxz07yj5/demo',
  ticker: '',
  synth: false,
}

describe('Kujira client Integration Tests', () => {
  beforeEach(() => {
    xchainClient = new KujiraClient({
      network: Network.Testnet,
      phrase: process.env.MAINNETPHRASE,
    })
  })
  it('should fetch balances kujira', async () => {
    const address = await xchainClient.getAddress()
    const balances = await xchainClient.getBalance(address)

    balances.forEach((bal) => {
      console.log(`${address} ${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should get transactions', async () => {
    const txs = await xchainClient.getTransactions({
      address: 'kujira1kltgthzruhvdm8u2rjtke69tppwys63rx3fk8a',
    })
    console.log('txs', txs)
    console.log('To:', txs.txs[0].to[0].amount.amount().toString())
    console.log('From:', txs.txs[0].from[0].amount.amount().toString())
  })
  it('should get transaction data', async () => {
    const tx = await xchainClient.getTransactionData('F3131AE603FFDE602217330410DD3ADFB9E21C987DDAA5CCF54F99DB15A6714B')
    console.log('tx', tx)
    tx.from.forEach((row) => console.log('from:', row.from, row.amount.amount().toString()))
    tx.to.forEach((row) => console.log('to:', row.to, row.amount.amount().toString()))
  })
  it('transfer', async () => {
    const txDate: TxParams = {
      asset: AssetKUJI,
      amount: baseAmount('1000', 6),
      recipient: 'kujira1es76p8qspctcxhex79c32nng9fvhuxjn4z6u7k',
      memo: 'Rosa melano',
    }
    const txHash = await xchainClient.transfer(txDate)
    console.log('txHash', txHash)
  })
  it('Try secondary token transfer', async () => {
    const txDate: TxParams = {
      asset: AssetTokenKuji,
      amount: baseAmount('100000', 6),
      recipient: 'kujira1es76p8qspctcxhex79c32nng9fvhuxjn4z6u7k',
      memo: 'Rosa melano',
    }
    const txHash = await xchainClient.transfer(txDate)
    console.log('txHash', txHash)
  })
})
