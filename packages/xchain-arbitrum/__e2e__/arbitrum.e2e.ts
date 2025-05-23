import { Balance, FeeOption, Network, TxType } from '@xchainjs/xchain-client'
import { AssetType, TokenAsset, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { Client as ArbClient } from '../src/client'
import { ARBChain, AssetARB, defaultArbParams } from '../src/const'

const mainnetClient = new ArbClient({
  ...defaultArbParams,
  phrase: process.env.MAINNET_PHRASE,
  network: Network.Mainnet,
})

const testnetClient = new ArbClient({
  ...defaultArbParams,
  phrase: process.env.TESTNET_PHRASE,
  network: Network.Testnet,
})

const MainnetUSDTAsset: TokenAsset = {
  chain: 'ARB',
  symbol: 'USDT-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  ticker: 'USDT',
  type: AssetType.TOKEN,
}

const TestnetUSDCAsset: TokenAsset = {
  chain: 'ARB',
  symbol: 'USDC-0x179522635726710dd7d2035a81d856de4aa7836c',
  ticker: 'USDC',
  type: AssetType.TOKEN,
}

describe('Arbitrum', () => {
  it('should fetch Arbitrum balances', async () => {
    const address = '0x46545017fa98CA2efeF277c90B4c0044ca913596'
    console.log(address)
    const balances = await mainnetClient.getBalance(address, [])
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch arbitrum txs', async () => {
    const address = '0x007ab5199b6c57f7aa51bc3d0604a43505501a0c'
    const txPage = await mainnetClient.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch arbitrum erc20 txs', async () => {
    const address = '0x9f0b60CD0FCfE9828a92c2F6f6E6B4Cf8DAb003a'
    const txPage = await mainnetClient.getTransactions({ address, asset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch arbitrum transfer transaction', async () => {
    const txId = '0x11bbb59714a8056e2af018692f6153b0514514fe9b9edd23d94d4220821159da'
    const tx = await testnetClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.001', 18))
    expect(tx.asset.chain).toBe(ARBChain)
    expect(tx.asset.ticker).toBe(AssetARB.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0x007ab5199b6c57f7aa51bc3d0604a43505501a0c')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0xf84919fb8111cb8ff4f7929e71ad5d2e7adaee0d')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should fetch arbitrum erc20 transfer transaction', async () => {
    const txId = '0x13390d52718eefb22af4dd159ec3697045b7e61a9b58d9ba1c80ae8bdc1b50e8'
    const tx = await testnetClient.getTransactionData(txId, '0x179522635726710Dd7D2035a81d856de4Aa7836c')
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('1000', 6))
    expect(tx.asset.chain).toBe(ARBChain)
    expect(tx.asset.ticker).toBe(TestnetUSDCAsset.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0xe77872fb49750e6ae361fc13aa67397637ddcf5d')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0xa81cfe9f2d4e42be8d5067b5487bd49576e2d5c6')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should self transfer 0.0001 Arbitrum ETH, with a memo using Average Option', async () => {
    const recipient = mainnetClient.getAddress(0)
    const amount = assetToBase(assetAmount('0.0001', 18))
    const memo = `test`
    const txHash = await mainnetClient.transfer({ amount, recipient, memo, feeOption: FeeOption.Average })
    console.log(txHash)
  })
  it('should transfer 0.0005 Arbitrum ETH between wallet 0 and 1, with a memo using EIP1559', async () => {
    const recipient = mainnetClient.getAddress(1)
    const amount = assetToBase(assetAmount('0.0005', 18))
    const maxFeePerGas = assetToBase(assetAmount('0.000000000135', 18))
    const memo = `test`
    const txHash = await mainnetClient.transfer({ amount, recipient, memo, maxFeePerGas })
    console.log(txHash)
  })
  it('should transfer 0.5 USDT between wallet 0 and 1, with a memo using EIP1559', async () => {
    const recipient = mainnetClient.getAddress(1)
    const amount = assetToBase(assetAmount('0.5', 6))
    const maxFeePerGas = assetToBase(assetAmount('0.000000000135', 18))
    const txHash = await mainnetClient.transfer({
      recipient,
      amount,
      asset: MainnetUSDTAsset,
      maxFeePerGas,
    })
    console.log(txHash)
  })
})
