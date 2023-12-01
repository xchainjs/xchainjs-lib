import { Balance } from '@xchainjs/xchain-client'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { RoutescanProvider } from '../src/providers'

describe('AVAX', () => {
  const address = ''
  const txHash = ''
  const tokenTxHash = ''
  const assetAddress = ''
  const rpcEndpint = 'https://api.avax.network/ext/bc/C/rpc'
  // Define here to avoid cyclic dependency
  const AVAXChain = 'AVAX'
  const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', synth: false }

  const provider = new ethers.providers.JsonRpcProvider(rpcEndpint)
  const dataProvider = new RoutescanProvider(provider, 'https://api.routescan.io', 43114, AssetAVAX, 18)

  it('should fetch all balances', async () => {
    const balances = await dataProvider.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
  }, 15000)
  it('should fetch native txs', async () => {
    const txs = await dataProvider.getTransactions({ address })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
  }, 15000)
  it('should fetch asset txs', async () => {
    const txs = await dataProvider.getTransactions({ address, asset: assetAddress })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
  }, 15000)
  it('get transaction', async () => {
    const tx = await dataProvider.getTransactionData(txHash)
    console.log(JSON.stringify(tx))
  }, 15000)
  it('get token transaction', async () => {
    const tx = await dataProvider.getTransactionData(tokenTxHash, assetAddress)
    console.log(JSON.stringify(tx))
  })
})

describe('ETH', () => {
  const address = ''
  const txHash = ''
  const tokenTxHash = ''
  const assetAddress = ''
  const rpcEndpint = ''
  // Define here to avoid cyclic dependency
  const ETHChain = 'ETH'
  const AssetETH: Asset = {
    chain: ETHChain,
    symbol: 'ETH',
    ticker: 'ETH',
    synth: false,
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcEndpint, 'homestead')
  const dataProvider = new RoutescanProvider(provider, 'https://api.routescan.io', 1, AssetETH, 18)

  it('should fetch all balances', async () => {
    const balances = await dataProvider.getBalance(address)
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
  }, 15000)
  it('should fetch native txs', async () => {
    const txs = await dataProvider.getTransactions({ address })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
  }, 15000)
  it('should fetch asset txs', async () => {
    const txs = await dataProvider.getTransactions({ address, asset: assetAddress })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
  }, 15000)
  it('get transaction', async () => {
    const tx = await dataProvider.getTransactionData(txHash)
    console.log(JSON.stringify(tx))
  }, 15000)
  it('get token transaction', async () => {
    const tx = await dataProvider.getTransactionData(tokenTxHash, assetAddress)
    console.log(JSON.stringify(tx))
  })
})
})
