import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient } from '@xchainjs/xchain-bitcoincash'
import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { Client as EthClient } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import {
  Asset,
  AssetRuneNative,
  BaseAmount,
  Chain,
  assetFromString,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'

export type Swap = {
  fromBaseAmount: BaseAmount
  to: Asset
}

let xchainClients: Record<Chain, XChainClient>

async function swapRuneTo(swap: Swap): Promise<string> {
  const thorClient = xchainClients.THOR as unknown as ThorchainClient
  const address = await xchainClients[swap.to.chain].getAddress()
  const memo = `=:${assetToString(swap.to)}:${address}`
  const hash = await thorClient.deposit({
    amount: swap.fromBaseAmount,
    asset: AssetRuneNative,
    memo,
  })

  return xchainClients.THOR.getExplorerTxUrl(hash)
}
function makeSwapRuneFor(amount: string, toAsset: string): Swap {
  const fromBaseAmount = baseAmount(amount)
  if (!fromBaseAmount) throw new Error(`could not parse ${amount} as basemount`)
  const to = assetFromString(toAsset)
  if (!to) throw new Error(`could not parse ${toAsset} as to asset`)

  const swap: Swap = {
    fromBaseAmount,
    to,
  }
  return swap
}

describe('thorchain Integration Tests', () => {
  beforeEach(() => {
    const settings = { network: 'testnet' as Network, phrase: process.env.PHRASE }
    xchainClients = {
      BCH: new BchClient(settings),
      BTC: new BtcClient(settings),
      ETH: new EthClient(settings),
      THOR: new ThorClient(settings),
      LTC: new LtcClient(settings),
      BNB: new BnbClient(settings),
      GAIA: new CosmosClient(settings), //FAKE for now
      POLKA: new BnbClient(settings), //FAKE for now
    }
  })
  it('should fetch thorchain balances', async () => {
    const address = xchainClients.THOR.getAddress(0)
    const balances = await xchainClients.THOR.getBalance(address)
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch thorchain txs', async () => {
    const address = xchainClients.THOR.getAddress(0)
    const txPage = await xchainClients.THOR.getTransactions({ address })
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
    txPage.txs.forEach((tx) => {
      console.log(JSON.stringify(tx, null, 2))
    })
    const txData = await xchainClients.THOR.getTransactionData(txPage.txs[0].hash)
    console.log(JSON.stringify(txData, null, 2))
  })

  it('should xfer rune from wallet 0 -> 1, with a memo', async () => {
    try {
      const addressTo = xchainClients.THOR.getAddress(1)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: AssetRuneNative,
        amount: baseAmount('100'),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const hash = await xchainClients.THOR.transfer(transferTx)
      expect(hash.length).toBeGreaterThan(0)
      console.log(xchainClients.THOR.getExplorerTxUrl(hash))
    } catch (error) {
      console.log(error)
      throw error
    }
  })
  it('should swap rune for BNB', async () => {
    const swap = makeSwapRuneFor('1000', 'BNB.BNB')

    try {
      const explorerUrl = await swapRuneTo(swap)
      expect(explorerUrl.length).toBeGreaterThan(5)
    } catch (error) {
      console.log(error)
      throw error
    }
  })
})
