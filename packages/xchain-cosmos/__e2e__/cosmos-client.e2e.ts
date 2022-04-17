import { Network, TxParams } from '@xchainjs/xchain-client'
import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { Chain, assetToString, baseAmount, delay } from '@xchainjs/xchain-util'

let xchainClient: CosmosClient = new CosmosClient({})

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

    expect(address0.length).toBeGreaterThan(0)
    expect(address0.startsWith('cosmos')).toBeTruthy()

    expect(address1.length).toBeGreaterThan(0)
    expect(address1.startsWith('cosmos')).toBeTruthy()
  })
  it('should xfer uatom from wallet 0 -> 1, with a memo', async () => {
    try {
      const addressTo = xchainClient.getAddress(1)
      const transferTx: TxParams = {
        walletIndex: 0,
        asset: { chain: Chain.Cosmos, ticker: 'ATOM', symbol: 'uatom', synth: false },
        amount: baseAmount('100', 6),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const res = await xchainClient.transfer(transferTx)
      expect(res.length).toBeGreaterThan(0)

    } catch (error) {
      throw error
    }
  })
  it('should fetch cosmos txs', async () => {
    const address = xchainClient.getAddress(0)
    const txPage = await xchainClient.getTransactions({ address })

    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fail xfer xxx from wallet 0 -> 1', async () => {
    try {
      const addressTo = xchainClient.getAddress(0)
      const transferTx: TxParams = {
        walletIndex: 1,
        asset: { chain: Chain.Cosmos, ticker: 'GAIA', symbol: 'xxx', synth: false },
        amount: baseAmount('100', 6),
        recipient: addressTo,
        memo: 'Hi!',
      }
      const txHash = await xchainClient.transfer(transferTx)
      expect(txHash.length).toBeGreaterThan(0)

      // Wait 35 seconds for the tx to process
      await delay(35 * 1000)

      const txResult = await xchainClient.getSDKClient().txsHashGet(txHash)
      expect(txResult.raw_log).toEqual('failed to execute message; message index: 0: 0xxx is smaller than 100xxx: insufficient funds')

    } catch (error) {
      throw error
    }
  })
})
