import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import { Asset, AssetRuneNative, BaseAmount, assetToString, baseAmount } from '@xchainjs/xchain-util'

export type Swap = {
  fromBaseAmount: BaseAmount
  to: Asset
}

const thorClient: XChainClient = new ThorClient({ network: Network.Testnet, phrase: process.env.PHRASE })
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
  it('should fetch thorchain txs', async () => {
    const address = thorClient.getAddress(0)
    const txPage = await thorClient.getTransactions({ address })
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
    txPage.txs.forEach((tx) => {
      console.log(JSON.stringify(tx, null, 2))
    })

    const txData = await thorClient.getTransactionData(txPage.txs[0].hash)
    console.log(JSON.stringify(txData, null, 2))
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
      console.log(thorClient.getExplorerTxUrl(hash))
    } catch (error) {
      console.log(error)
      throw error
    }
  })
  it('should swap some rune for BNB', async () => {
    try {
      const address = await bnbClient.getAddress()
      const memo = `=:BNB.BNB:${address}`

      const hash = await thorchainClient.deposit({
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
})
