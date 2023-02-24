import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Network, TxParams, XChainClient } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, assetToString, baseAmount, delay } from '@xchainjs/xchain-util'

import { AssetRuneNative } from '../src'
import { Client as ThorClient, ThorchainClient } from '../src/index'

export type Swap = {
  fromBaseAmount: BaseAmount
  to: Asset
}

// Mock chain ids
const chainIds = {
  [Network.Mainnet]: 'thorchain-mainnet-v1',
  [Network.Stagenet]: 'chain-id-stagenet',
  [Network.Testnet]: 'deprecated',
}

const thorClient: XChainClient = new ThorClient({
  network: Network.Mainnet,
  phrase: process.env.PHRASE,
  chainIds: chainIds,
})
const thorchainClient = (thorClient as unknown) as ThorchainClient
const bnbClient: XChainClient = new BnbClient({ network: Network.Mainnet, phrase: process.env.PHRASE })

// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// axios.interceptors.response.use((response) => {
//   console.log('Response:', JSON.stringify(response, null, 2))
//   return response
// })

describe('thorchain Integration Tests', () => {
  it('should fetch thorchain balances', async () => {
    // const address = thorClient.getAddress(0)
    const balances = await thorClient.getBalance('thor18958nd6r803zespz8lff3jxlamgnv82pe87jaw')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should xfer rune from wallet 0 -> 1, with a memo and custom sequence', async () => {
    try {
      const addressTo = thorClient.getAddress(1)
      const transferTx = {
        walletIndex: 0,
        asset: AssetRuneNative,
        amount: baseAmount('100'),
        recipient: addressTo,
        memo: 'Hi!',
        sequence: 1,
      }
      await thorClient.transfer(transferTx)
      fail()
    } catch (error) {
      expect(error.toString().includes('account sequence mismatch')).toBe(true)
    }
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
  it('should fetch thorchain tx data', async () => {
    const txId = 'ED631AF5CB1DD2294220FC62F01F6ECE2343A9ED8DD0B44CE9473A085B41F737'
    const tx = await thorClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe('ED631AF5CB1DD2294220FC62F01F6ECE2343A9ED8DD0B44CE9473A085B41F737')
    // expect(tx.asset.ticker).toBe('xx')
  })

  it('should get synth asset from synth tx', async () => {
    const txId = 'FF900F04B145799668AB9975E40C51E42024D8761330D2210DCC8447F44218AF'
    const tx = await thorClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))

    expect(tx.hash).toBe('FF900F04B145799668AB9975E40C51E42024D8761330D2210DCC8447F44218AF')
    expect(tx.asset.ticker).toBe('btc')
    expect(tx.asset.synth).toBeTruthy()
    expect(tx.from[0].asset?.chain).toBe('btc')
    expect(tx.from[0].asset?.symbol).toBe('btc')
  })
  it('should get RUNE asset from RUNE tx', async () => {
    const txId = 'EAC3D95D9160D4CF5A0BD861BDD9A7C5ACBA102B3A825FECD01581393BF76AEF'
    const tx = await thorClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))

    expect(tx.hash).toBe('EAC3D95D9160D4CF5A0BD861BDD9A7C5ACBA102B3A825FECD01581393BF76AEF')
    expect(tx.asset.ticker).toBe('RUNE')
  })
  it('should get THOR.RUNE to ETH.ETH inbound', async () => {
    // thor.rune msgDeposit (inbound)
    const txId = '3F763B3F874DC5EEEA965D570A0C8DCA68915669D38A486A826B2238447E5498'
    const tx = await thorClient.getTransactionData(txId)

    console.log(JSON.stringify(tx, null, 2))

    expect(tx.hash).toBe(txId)
    expect(tx.from[0].asset?.chain).toBe('THOR')
    expect(tx.from[0].asset?.symbol).toBe('RUNE')
    expect(tx.from[0].amount.amount().toFixed()).toBe('2000000000')
    expect(tx.from[0].from).toBe('thor1zdf2n0jx9nqvdnd2u3y93t5y0rs4znnv9rn5zc')

    expect(tx.to[0].asset?.chain).toBe('ETH')
    expect(tx.to[0].asset?.symbol).toBe('ETH')
    expect(tx.to[0].to).toBe('0x17AF7fd6Eb8D414be10296dcac9b922D9c9F0076')

    // // asgard -> eth (outbound)
    const outboundTxId = '0049ECD2785F84D845DC2FA29E1046CBB39F0EFB1D991CB48F97A577887D5613'
    const outboundTx = await thorClient.getTransactionData(outboundTxId)
    console.log(JSON.stringify(outboundTx, null, 2))
    expect(outboundTx.hash).toBe(outboundTxId)
    expect(outboundTx.from[0].asset?.chain).toBe('ETH')
    expect(outboundTx.from[0].asset?.symbol).toBe('ETH')

    expect(tx.to[0].asset?.chain).toBe('ETH')
    expect(tx.to[0].asset?.symbol).toBe('ETH')
  })
  it('should get ETH.ETH to THOR.RUNE inbound', async () => {
    // eth.eth (inbound)
    const txId = '7FDFBD0B884376B2ED4F615476787C08FF569C181566052A3907535529347FBA'
    const tx = await thorClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))

    expect(tx.hash).toBe(txId)
    expect(tx.from[0].asset?.chain).toBe('ETH')
    expect(tx.from[0].asset?.symbol).toBe('ETH')
    expect(tx.from[0].from).toBe('0xd4d99d205e67e88e5e19d91afd6fcab665b532e8')

    expect(tx.to[0].asset?.chain).toBe('THOR')
    expect(tx.to[0].asset?.symbol).toBe('RUNE')
    expect(tx.to[0].to).toBe('thor1auu0xc7zzcestqt60g429gpfkk9ynhqazw3epa')

    // asgard -> eth (outbound)
    const outboundTxId = '0049ECD2785F84D845DC2FA29E1046CBB39F0EFB1D991CB48F97A577887D5613'
    const outboundTx = await thorClient.getTransactionData(outboundTxId)
    console.log(JSON.stringify(outboundTx, null, 2))
    expect(outboundTx.hash).toBe(outboundTxId)
    expect(outboundTx.from[0].asset?.chain).toBe('ETH')
    expect(outboundTx.from[0].asset?.symbol).toBe('ETH')

    expect(outboundTx.to[0].asset?.chain).toBe('ETH')
    expect(outboundTx.to[0].asset?.symbol).toBe('ETH')
  })
  it('should get RUNE asset from RUNE to RUNE', async () => {
    const txId = 'C948F21D5218A2A20218B99B7A37C9274FED26D31619FD054383D8E98A866AEB'
    const tx = await thorClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))

    expect(tx.hash).toBe('C948F21D5218A2A20218B99B7A37C9274FED26D31619FD054383D8E98A866AEB')
    expect(tx.asset.ticker).toBe('RUNE')
  })
})
