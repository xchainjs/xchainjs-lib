import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
import {
  Asset,
  BaseAmount,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  delay,
} from '@xchainjs/xchain-util'

import { Client as MayaClient } from '../src/client'
import { AssetCacao, CACAO_DECIMAL } from '../src/const'
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

const mayaClient = new MayaClient({
  network: Network.Mainnet,
  phrase: process.env.PHRASE_MAYA,
  chainIds: chainIds,
})
const mayachainClient = mayaClient
const bnbClient: XChainClient = new BnbClient({ network: Network.Mainnet, phrase: process.env.PHRASE })

describe('Mayachain Integration Tests', () => {
  it('should fetch mayachain balances', async () => {
    const address = await mayaClient.getAddressAsync(0)
    console.log('address', address)
    const balances = await mayaClient.getBalance(address)
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should xfer cacao from wallet 0 -> 1, with a memo and custom sequence', async () => {
    try {
      const addressTo = await mayaClient.getAddressAsync(1)
      const transferTx = {
        walletIndex: 0,
        asset: AssetCacao,
        amount: baseAmount('100', CACAO_DECIMAL),
        recipient: addressTo,
        memo: 'Hi!',
        sequence: 1,
      }
      await mayaClient.transfer(transferTx)
      fail()
    } catch (error: any) {
      expect(error.toString().includes('account sequence mismatch')).toBe(true)
    }
  })
  it('should transfer cacao from wallet 0 -> 1, with a memo', async () => {
    try {
      const addressTo = await mayaClient.getAddressAsync(1)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: AssetCacao,
        amount: baseAmount('100', CACAO_DECIMAL),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const hash = await mayaClient.transfer(transferTx)
      console.log('hash', hash)
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

      const address = bnbClient.getAddress()
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
  it('should swap some ETH/ETH for CACAO', async () => {
    try {
      const address = await mayachainClient.getAddressAsync()
      const memo = `=:MAYA.CACAO:${address}`

      const hash = await mayachainClient.deposit({
        walletIndex: 0,
        amount: baseAmount('10000', 8),
        asset: assetFromString('ETH/ETH') as Asset,
        memo,
      })
      console.log('hash', hash)
      expect(hash.length).toBeGreaterThan(5)
    } catch (error) {
      console.log(error)
      throw error
    }
  })

  it('should transfer some ETH/ETH', async () => {
    try {
      const address = await mayachainClient.getAddressAsync(1)
      const asset = assetFromString('ETH/ETH') as Asset
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: asset,
        amount: baseAmount('30000', 8),
        recipient: address,
      }
      const hash = await mayaClient.transfer(transferTx)
      expect(hash.length).toBeGreaterThan(5)
    } catch (error) {
      console.log(error)
      throw error
    }
  })

  it('should swap some CACAO for ETH/ETH', async () => {
    try {
      // Wait 10 seconds, make sure previous test has finished to avoid sequnce conflict
      await delay(10 * 1000)

      const address = await mayachainClient.getAddressAsync()
      const memo = `=:ETH/ETH:${address}`

      const hash = await mayachainClient.deposit({
        walletIndex: 0,
        amount: baseAmount('100000000000', CACAO_DECIMAL),
        asset: AssetCacao,
        memo,
      })
      console.log('hash', hash)
      expect(hash.length).toBeGreaterThan(5)
    } catch (error) {
      console.log(error)
      throw error
    }
  })

  it('should fetch mayachain txs', async () => {
    const address = await mayaClient.getAddressAsync(0)
    const txPage = await mayaClient.getTransactions({ address })
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch mayachain tx data', async () => {
    const txId = '28DA11D33AC96BA87981F45FCB2EC80536C60BB824321E0CAEF097D10B568BA5'
    const tx = await mayaClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe('28DA11D33AC96BA87981F45FCB2EC80536C60BB824321E0CAEF097D10B568BA5')
    // expect(tx.asset.ticker).toBe('xx')
  })
  it('should prepare transaction', async () => {
    try {
      const from = 'maya1fs0zqmeulyej044snvkey5mu5xp9d4xc9dxzar'
      const to = 'maya1fs0zqmeulyej044snvkey5mu5xp9d4xc9dxzar'
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await mayaClient.prepareTx({
        sender: from,
        recipient: to,
        amount,
        memo: 'test',
      })
      console.log(rawUnsignedTransaction)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
