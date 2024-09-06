import { Balance, FeeOption, Network, TxType } from '@xchainjs/xchain-client'
import { AssetType, TokenAsset, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { BASEChain, defaultBaseParams } from '../src/const'
import { Client as BaseClient } from '../src/index'

const mainnetClient = new BaseClient({
  ...defaultBaseParams,
  phrase: process.env.MAINNET_PHRASE,
  network: Network.Mainnet,
})

const testnetClient = new BaseClient({
  ...defaultBaseParams,
  phrase: process.env.TESTNET_PHRASE,
  network: Network.Mainnet,
})

const MainnetUSDTAsset: TokenAsset = {
  chain: 'BASE',
  symbol: 'USDT-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  ticker: 'USDT',
  type: AssetType.TOKEN,
}

const TestnetUSDCAsset: TokenAsset = {
  chain: 'BASE',
  symbol: 'USDC-0x179522635726710dd7d2035a81d856de4aa7836c',
  ticker: 'USDC',
  type: AssetType.TOKEN,
}
describe('Base', () => {
  it('should fetch Base balances', async () => {
    const address = testnetClient.getAddress(0)
    console.log(address)
    const balances = await testnetClient.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
  })
  it('should fetch base txs', async () => {
    const address = '0x007ab5199b6c57f7aa51bc3d0604a43505501a0c'
    const txPage = await testnetClient.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch base erc20 txs', async () => {
    const address = '0x525868063dfB084A3542e2DFeb60D81e21d79c31'
    const txPage = await testnetClient.getTransactions({
      address,
      asset: 'BASE.USDT-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should fetch base transfer transaction', async () => {
    const txId = '0xe9ac3d72f448923ca9d514de8ad2454d7a09e89072e07b480bce15ff203cd9fd'
    const tx = await testnetClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('0.003', 18))
    expect(tx.asset.chain).toBe(BASEChain)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0x38019bc40f504be4546f24083ccaf0c8553c408a')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0xf84919fb8111cb8ff4f7929e71ad5d2e7adaee0d')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should fetch base erc20 transfer transaction', async () => {
    const txId = '0x13390d52718eefb22af4dd159ec3697045b7e61a9b58d9ba1c80ae8bdc1b50e8'
    const tx = await testnetClient.getTransactionData(txId, '0x179522635726710Dd7D2035a81d856de4Aa7836c')
    console.log(JSON.stringify(tx, null, 2))
    const amount = assetToBase(assetAmount('1000', 6))
    expect(tx.asset.chain).toBe(BASEChain)
    expect(tx.asset.ticker).toBe(TestnetUSDCAsset.ticker)
    expect(tx.type).toBe(TxType.Transfer)
    expect(tx.from[0].from).toBe('0xe77872fb49750e6ae361fc13aa67397637ddcf5d')
    expect(tx.from[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.to[0].to).toBe('0xa81cfe9f2d4e42be8d5067b5487bd49576e2d5c6')
    expect(tx.to[0].amount.amount().toFixed()).toBe(amount.amount().toFixed())
    expect(tx.hash).toBe(txId)
  })
  it('should get fee rates', async () => {
    const recipient = await mainnetClient.estimateGasPrices()

    console.log(recipient)
  })

  it('should self transfer 0.0001 Base ETH, with a memo using Average Option', async () => {
    const recipient = mainnetClient.getAddress(0)
    const amount = assetToBase(assetAmount('0.001', 18))
    const memo = `test`
    const txHash = await mainnetClient.transfer({ amount, recipient, memo, feeOption: FeeOption.Average })
    console.log(txHash)
  })
  it('should transfer 0.0005 base ETH between wallet 0 and 1, with a memo using EIP1559', async () => {
    const recipient = mainnetClient.getAddress(0)
    const amount = assetToBase(assetAmount('0.001', 18))
    const maxFeePerGas = assetToBase(assetAmount('0.0000000135', 18))
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
