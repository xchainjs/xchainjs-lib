import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { Chain, assetToString, baseAmount } from '@xchainjs/xchain-util'

let xchainClient: XChainClient = new CosmosClient({})

describe('Cosmos Integration Tests', () => {
  beforeEach(() => {
    const settings = { network: Network.Testnet, phrase: process.env.PHRASE }
    xchainClient = new CosmosClient(settings)
  })
  it('should fetch cosmos balances', async () => {
    const address = xchainClient.getAddress(0)
    const balances = await xchainClient.getBalance(address)
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })

  it('should generate cosmos addreses', async () => {
    const address0 = xchainClient.getAddress(0)
    const address1 = xchainClient.getAddress(1)
    console.log(address0)
    console.log(address1)
  })
  //TODO failing, find the fix, probably to pull from RPC endpoint
  // it('should fetch cosmos txs', async () => {
  //   const address = xchainClient.getAddress(0)
  //   const txPage = await xchainClient.getTransactions({ address })
  //   expect(txPage.total).toBeGreaterThan(0)
  //   expect(txPage.txs).toBeGreaterThan(0)
  //   txPage.txs.forEach((tx) => {
  //     console.log(JSON.stringify(tx, null, 2))
  //   })
  // })
  it('should xfer atom from wallet 0 -> 1, with a memo', async () => {
    try {
      const addressTo = xchainClient.getAddress(1)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: { chain: Chain.Cosmos, ticker: 'GAIA', symbol: 'uphoton' },
        amount: baseAmount('100'),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const hash = await xchainClient.transfer(transferTx)
      expect(hash.length).toBeGreaterThan(0)
      console.log(xchainClient.getExplorerTxUrl(hash))
    } catch (error) {
      console.log(error)
      throw error
    }
  })
})
