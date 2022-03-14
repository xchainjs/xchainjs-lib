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
      const hash = await xchainClient.transfer(transferTx)
      expect(hash.length).toBeGreaterThan(0)

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
      console.log('addressTo: ', addressTo)
      const transferTx: TxParams = {
        walletIndex: 1,
        asset: { chain: Chain.Cosmos, ticker: 'GAIA', symbol: 'xxx', synth: false },
        amount: baseAmount('100', 6),
        recipient: addressTo,
        memo: 'Hi!',
      }
      await xchainClient.transfer(transferTx)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      expect(e.message).toEqual(
        'Error broadcasting: failed to execute message; message index: 0: 0xxx is smaller than 100xxx: insufficient funds',
      )
    }
  })
})
