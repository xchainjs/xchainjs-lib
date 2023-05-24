import { Network, UtxoClientParams } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { Client, NodeAuth, NodeUrls } from '../src/client'
import { AssetDASH, BlockcypherDataProviders, LOWER_FEE_BOUND, UPPER_FEE_BOUND, explorerProviders } from '../src/const'

const defaultDashParams: UtxoClientParams & {
  nodeUrls: NodeUrls
  nodeAuth?: NodeAuth
} = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/5'/0'/0/`,
    [Network.Stagenet]: `m/44'/5'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://dash.ninerealms.com',
    [Network.Stagenet]: 'https://dash.ninerealms.com',
    [Network.Testnet]: 'https://testnet.dash.thorchain.info',
  },
}

const dashClient = new Client({
  ...defaultDashParams,
})

const dashClientTestnet = new Client({
  ...defaultDashParams,
  network: Network.Testnet,
  phrase: process.env.PHRASE,
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
    const address = dashClientTestnet.getAddress()
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
    expect(txHistory.total).toBe(1)
    expect(txHistory.txs[0].asset).toEqual(AssetDASH)
    expect(txHistory.txs[0].hash).toEqual('0f93b895999a93e2ff91fadc53ff6037292263011df44478ce14d8ca72a94c7e')
    expect(txHistory.txs[0].type).toEqual('transfer')

    txHistory = await dashClient.getTransactions({ address, offset: 50000, limit: 10 })
    expect(txHistory.total).toBe(0)

    txHistory = await dashClient.getTransactions({ address, offset: 0, limit: 40 })
    expect(txHistory.total).toBe(40)

    txHistory = await dashClient.getTransactions({ address, offset: 11, limit: 20 })
    expect(txHistory.total).toBe(20)
    expect(txHistory.txs[0].hash).toEqual('1cee349a214267c211f05cccd1bbcef994958496f470ee41f4a7c80375904d4b')
    expect(txHistory.txs[19].hash).toEqual('f374dfcce7baaadf0578a03816d5ab3a390388e38e898c4353d8481b4592a0f8')

    try {
      txHistory = await dashClient.getTransactions({ address, offset: -1, limit: 10 })
      fail()
    } catch (error) {}
    try {
      txHistory = await dashClient.getTransactions({ address, offset: 0, limit: -10 })
      fail()
    } catch (error) {}

    expect(txHistory.total).toBeGreaterThan(0)
  })
  it('should fetch Dash tx data', async () => {
    const txId = '91a7a17110081c1f3da4b71d1526e4cb8494b5727521b32b2caf25fb8409619a'
    const tx = await dashClient.getTransactionData(txId)
    expect(tx.hash).toBe(txId)
  })
  it('should send a testnet btc tx', async () => {
    try {
      // const from = dashClientTestnet.getAddress(0)
      const to = dashClientTestnet.getAddress(1)
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
})
