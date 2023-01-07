import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
import { Client as MayaClient, MayachainClient } from '@xchainjs/xchain-mayachain'
import { Asset, AssetCacao, BaseAmount, assetToString, baseAmount, delay } from '@xchainjs/xchain-util'
// import axios from 'axios'

export type Swap = {
  fromBaseAmount: BaseAmount
  to: Asset
}

// Mock chain ids
const chainIds = {
  [Network.Mainnet]: 'mayachain-mainnet-v1',
  [Network.Stagenet]: 'mayachain-stagenet-v1',
  [Network.Testnet]: 'deprecated',
}

const mayaClient: XChainClient = new MayaClient({
  network: Network.Stagenet,
  phrase: process.env.PHRASE,
  chainIds: chainIds,
})
const mayachainClient = (mayaClient as unknown) as MayachainClient
const bnbClient: XChainClient = new BnbClient({ network: Network.Mainnet, phrase: process.env.PHRASE })

// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// axios.interceptors.response.use((response) => {
//   console.log('Response:', JSON.stringify(response, null, 2))
//   return response
// })

describe('Mayachain Integration Tests', () => {
  it('should fetch mayachain balances', async () => {
    // const address = mayaClient.getAddress(0)
    const balances = await mayaClient.getBalance('smaya126xjtvyc4gygpa0vffqwluclhmvnfgtz83rcyx')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should xfer cacao from wallet 0 -> 1, with a memo and custom sequence', async () => {
    try {
      const addressTo = mayaClient.getAddress(1)
      const transferTx = {
        walletIndex: 0,
        asset: AssetCacao,
        amount: baseAmount('100'),
        recipient: addressTo,
        memo: 'Hi!',
        sequence: 1,
      }
      await mayaClient.transfer(transferTx)
      fail()
    } catch (error) {
      expect(error.toString().includes('account sequence mismatch')).toBe(true)
    }
  })
  it('should xfer cacao from wallet 0 -> 1, with a memo', async () => {
    try {
      const addressTo = mayaClient.getAddress(1)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: AssetCacao,
        amount: baseAmount('100'),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const hash = await mayaClient.transfer(transferTx)
      expect(hash.length).toBeGreaterThan(0)
    } catch (error) {
      console.log(error)
      throw error
    }
  })
  it('should swap some cacao for BNB', async () => {
    try {
      // Wait 10 seconds, make sure previous test has finished to avoid sequnce conflict
      await delay(10 * 1000)

      const address = await bnbClient.getAddress()
      const memo = `=:BNB.BNB:${address}`

      const hash = await mayachainClient.deposit({
        walletIndex: 0,
        amount: baseAmount('100'),
        asset: AssetCacao,
        memo,
      })

      expect(hash.length).toBeGreaterThan(5)
    } catch (error) {
      console.log(error)
      throw error
    }
  })
  it('should fetch mayachain txs', async () => {
    const address = mayaClient.getAddress(0)
    const txPage = await mayaClient.getTransactions({ address })
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch mayachain tx data', async () => {
    const txId = '63C7B481C52EAAA5BE6D603C91CE6011CA4B9A5987214D316C208DE19106D430'
    const tx = await mayaClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe('63C7B481C52EAAA5BE6D603C91CE6011CA4B9A5987214D316C208DE19106D430')
    // expect(tx.asset.ticker).toBe('xx')
  })
})
