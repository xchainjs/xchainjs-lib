// import { Network, TxType } from '@xchainjs/xchain-client'
import { Balance } from '@xchainjs/xchain-client'
import { EtherscanProvider } from '@xchainjs/xchain-evm'
import { assetToString } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { AVAXChain, AssetAVAX } from '../src/const'

// =====Erc-20 asset=====

// const assetRIP: Asset = {
//   chain: AVAXChain,
//   symbol: `RIP-0x224695Ba2a98E4a096a519B503336E06D9116E48`,
//   ticker: `RIP`,
//   synth: false,
// }

// =====Ethers providers=====
// const AVALANCHE_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider(
  'https://api.avax-test.network/ext/bc/C/rpc',
)
const provider = new EtherscanProvider(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api-testnet.snowtrace.io',
  'fake',
  AVAXChain,
  AssetAVAX,
  18,
)

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }
describe('etherscan Integration Tests', () => {
  it('should fetch all balances', async () => {
    const balances = await provider.getBalance('0xf32DA51880374201852057009c4c4d1e75949e09')
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch all balances 2', async () => {
    const balances = await provider.getBalance('0x55aEd0ce035883626e536254dda2F23a5b5D977f')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(10)
  })
  it('should fetch alltxs', async () => {
    const txs = await provider.getTransactions({ address: '0x55aEd0ce035883626e536254dda2F23a5b5D977f' })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
    expect(txs.total).toBeGreaterThan(10)
  })
})
