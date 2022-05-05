import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import { Asset, AssetRuneNative, BaseAmount, assetToString, baseAmount, delay } from '@xchainjs/xchain-util'

export type Swap = {
  fromBaseAmount: BaseAmount
  to: Asset
}

// Mock chain ids
const chainIds = {
  [Network.Mainnet]: 'thorchain-mainnet-v1',
  [Network.Stagenet]: 'chain-id-stagenet',
  [Network.Testnet]: 'thorchain-testnet-v2',
}

const thorClient: XChainClient = new ThorClient({
  network: Network.Testnet,
  phrase: process.env.PHRASE,
  chainIds: chainIds,
})
const thorchainClient = (thorClient as unknown) as ThorchainClient
const bnbClient: XChainClient = new BnbClient({ network: Network.Testnet, phrase: process.env.PHRASE })

describe('thorchain Integration Tests', () => {
  it('should fetch thorchain balances', async () => {
    const address = thorClient.getAddress(0)
    const balances = await thorClient.getBalance(address)
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should xfer rune from wallet 0 -> 1, with a memo', async () => {
    try {
      const addressTo = thorClient.getAddress(1)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: AssetRuneNative,
        amount: baseAmount('100'),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const hash = await thorClient.transfer(transferTx)
      expect(hash.length).toBeGreaterThan(0)
    } catch (error) {
      console.log(error)
      throw error
    }
  })
  it('should swap some rune for BNB', async () => {
    try {
      // Wait 10 seconds, make sure previous test has finished to avoid sequnce conflict
      await delay(10 * 1000)

      const address = await bnbClient.getAddress()
      const memo = `=:BNB.BNB:${address}`

      const hash = await thorchainClient.deposit({
        walletIndex: 0,
        amount: baseAmount('100'),
        asset: AssetRuneNative,
        memo,
      })

      expect(hash.length).toBeGreaterThan(5)
    } catch (error) {
      console.log(error)
      throw error
    }
  })
  it('should fetch thorchain txs', async () => {
    const address = thorClient.getAddress(0)
    const txPage = await thorClient.getTransactions({ address })
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
})
