import { Balance } from '@xchainjs/xchain-client'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { EtherscanProvider } from '../src/providers'

// =====Erc-20 asset=====

// const assetRIP: Asset = {
//   chain: AVAXChain,
//   symbol: `RIP-0x224695Ba2a98E4a096a519B503336E06D9116E48`,
//   ticker: `RIP`,
//   synth: false,
// }

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }
describe('etherscan Integration Tests (AVAX)', () => {
  // const AVALANCHE_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
  const AVALANCHE_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider(
    'https://api.avax-test.network/ext/bc/C/rpc',
  )
  // Define here to avoid cyclic dependency
  const AVAXChain = 'AVAX'
  const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', synth: false }
  const avaxProvider = new EtherscanProvider(
    AVALANCHE_TESTNET_ETHERS_PROVIDER,
    'https://api-testnet.snowtrace.io',
    'fake',
    AVAXChain,
    AssetAVAX,
    18,
  )
  it('should fetch all balances', async () => {
    const balances = await avaxProvider.getBalance('0xf32DA51880374201852057009c4c4d1e75949e09')
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch all balances 2', async () => {
    const balances = await avaxProvider.getBalance('0x55aEd0ce035883626e536254dda2F23a5b5D977f')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(10)
  })
  it('should fetch alltxs', async () => {
    const txs = await avaxProvider.getTransactions({ address: '0x55aEd0ce035883626e536254dda2F23a5b5D977f' })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
    expect(txs.total).toBeGreaterThan(10)
  })
})

describe('etherscan Integration Tests (BSC)', () => {
  const BSC_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://bsc-testnet.public.blastapi.io')
  // Define here to avoid cyclic dependency
  const BSCChain = 'BSC'
  const AssetBSC: Asset = {
    chain: BSCChain,
    symbol: 'BNB',
    ticker: 'BNB',
    synth: false,
  }
  const provider = new EtherscanProvider(
    BSC_TESTNET_ETHERS_PROVIDER,
    'https://api-testnet.bscscan.com',
    process.env['BSCCHAIN_API_KEY'] || '',
    BSCChain,
    AssetBSC,
    18,
  )
  it('should fetch all balances 1', async () => {
    const balances = await provider.getBalance('0x0af7e0671c82920c28e951e40c4bd20b5fc3937d')
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch all balances 2', async () => {
    const balances = await provider.getBalance('0xE80aCFfd88fe03129812da0Ef1ce60872D373768')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(3)
  })
  it('should fetch alltxs', async () => {
    const txs = await provider.getTransactions({ address: '0x35552c16704d214347f29Fa77f77DA6d75d7C752' })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
    expect(txs.total).toBeGreaterThan(10)
  })
})

describe('etherscan Integration Tests (ETH)', () => {
  const ETH_TESTNET_ETHERS_PROVIDER = new ethers.providers.EtherscanProvider(
    'sepolia',
    process.env['ETHERSCAN_API_KEY'],
  )
  // Define here to avoid cyclic dependency
  const ETHChain = 'ETH'
  const AssetETH: Asset = {
    chain: ETHChain,
    symbol: 'ETH',
    ticker: 'ETH',
    synth: false,
  }
  const provider = new EtherscanProvider(
    ETH_TESTNET_ETHERS_PROVIDER,
    'https://api-sepolia.etherscan.io/',
    process.env['ETHERSCAN_API'] || '',
    ETHChain,
    AssetETH,
    18,
  )
  it('should fetch all balances 1', async () => {
    const balances = await provider.getBalance('0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF')
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })

  it('should fetch alltxs', async () => {
    const txs = await provider.getTransactions({ address: '0x26000cc95ab0886FE8439E53c73b1219Eba9DBCF' })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
    expect(txs.total).toBeGreaterThan(10)
  })
})
