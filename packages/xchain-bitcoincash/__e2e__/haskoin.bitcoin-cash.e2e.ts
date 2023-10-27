import { Network, UtxoClientParams } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { Client } from '../src/client'
import { AssetBCH, HaskoinDataProviders, LOWER_FEE_BOUND, UPPER_FEE_BOUND, explorerProviders } from '../src/const'

const defaultBCHParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: process.env.PHRASE,
  explorerProviders: explorerProviders,
  dataProviders: [HaskoinDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
    [Network.Testnet]: `84'/1'/0'/0/`,
    [Network.Stagenet]: `84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

const bchClient = new Client({
  ...defaultBCHParams,
})

const bchClientTestnet = new Client({
  ...defaultBCHParams,
  network: Network.Testnet,
  phrase: process.env.TESTNETPHRASE,
})

// const bchAddress = 'qqqmwluxjte4u83lkqmare5klap5t38eyq8gdzxhhm'
describe('Bitcoincash Integration Tests for Haskoin', () => {
  it('should fetch address balance using haskoin', async () => {
    const address = bchClient.getAddress()
    const balances = await bchClient.getBalance(address)
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch previous transactions using haskoin', async () => {
    let txHistory = await bchClient.getTransactions({
      address: 'qrktmh470uvn8ludcgvsqdqm425zvwgj3g2pnrqgnh',
      offset: 0,
      limit: 10,
    })
    expect(txHistory.total).toBe(10)

    txHistory = await bchClient.getTransactions({
      address: 'qrktmh470uvn8ludcgvsqdqm425zvwgj3g2pnrqgnh',
      offset: 5,
      limit: 1,
    })
    expect(txHistory.total).toBe(1)

    const address = 'qrktmh470uvn8ludcgvsqdqm425zvwgj3g2pnrqgnh'
    txHistory = await bchClient.getTransactions({ address, offset: 5, limit: 1 })
    expect(txHistory.total).toBe(1)
    expect(txHistory.txs[0].asset).toEqual(AssetBCH)
    // expect(txHistory.txs[0].hash).toEqual('a9cadbf0a59bbee3253c30978c00eb587a16c7e41421732968fd9626a7fea8af')
    expect(txHistory.txs[0].type).toEqual('transfer')

    txHistory = await bchClient.getTransactions({ address, offset: 500, limit: 10 })
    expect(txHistory.total).toBe(0)

    txHistory = await bchClient.getTransactions({ address, offset: 0, limit: 40 })
    expect(txHistory.total).toBe(29)

    txHistory = await bchClient.getTransactions({ address, offset: 11, limit: 20 })
    expect(txHistory.total).toBe(18)

    try {
      txHistory = await bchClient.getTransactions({ address, offset: -0, limit: 10 })
      fail()
    } catch (error) {}
    try {
      txHistory = await bchClient.getTransactions({ address, offset: 0, limit: -10 })
      fail()
    } catch (error) {}

    // for (const tx of txHistory.txs) {
    //   console.log(tx.hash, tx.date)
    //   console.log(tx.from[0].from, tx.from[0].amount.amount().toFixed())
    //   console.log(tx.to[0].to, tx.to[0].amount.amount().toFixed())
    //   // console.log(JSON.stringify(txHistory, null, 2))
    // }
  })
  it('should fetch bch tx data using haskoin', async () => {
    const txId = '95fac11a1596f750e7bd0c2600668fdaf9aa4e69fd38490e060d644bece1d2a5'
    const tx = await bchClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe(txId)
  })
  it('should send a testnet bch tx using haskoin', async () => {
    try {
      console.log(bchClientTestnet.getAddress(0))
      const to = bchClientTestnet.getAddress(1)
      const amount = assetToBase(assetAmount('0.00001'))
      const txid = await bchClientTestnet.transfer({
        asset: AssetBCH,
        recipient: to,
        amount,
        memo: 'test',
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('should prepare transaction', async () => {
    try {
      const from = 'qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g'
      const to = 'qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g'
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await bchClientTestnet.prepareTx({
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
