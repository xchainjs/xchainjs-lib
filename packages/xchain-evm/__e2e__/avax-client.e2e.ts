import { Network } from '@xchainjs/xchain-client'
import { AssetAVAX, Chain, assetToString } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { Client, EVMClientParams } from '../src/client'
import { CovalentProvider } from '../src/providers/covalent-data-provider'
import { ExplorerProvider } from '../src/providers/explorer-provider'

// =====Ethers providers=====
const AVALANCHE_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider(
  'https://api.avax-test.network/ext/bc/C/rpc',
)

const ethersJSProviders = {
  [Network.Mainnet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: AVALANCHE_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
}
// =====Ethers providers=====
// =====ONLINE providers=====
const API_KEY = process.env.COVALENT_API_KEY || ''
const AVAX_ONLINE_PROVIDER_MAINNET = new CovalentProvider(API_KEY, Chain.Avalanche, 43114, AssetAVAX, 18)
const AVAX_ONLINE_PROVIDER_TESTNET = new CovalentProvider(API_KEY, Chain.Avalanche, 43113, AssetAVAX, 18)
const avaxProviders = {
  [Network.Mainnet]: AVAX_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: AVAX_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: AVAX_ONLINE_PROVIDER_MAINNET,
}
// =====ONLINE providers=====

// =====Explorers=====
const AVAX_MAINNET_EXPLORER = new ExplorerProvider(
  'https://snowtrace.io/',
  'https://snowtrace.io/tx/%%TX_ID%%',
  'https://snowtrace.io/address/%%ADDRESS%%',
)
const AVAX_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.snowtrace.io/',
  'https://testnet.snowtrace.io/tx/%%TX_ID%%',
  'https://testnet.snowtrace.io/address/%%ADDRESS%%',
)
const avaxExplorerProviders = {
  [Network.Mainnet]: AVAX_MAINNET_EXPLORER,
  [Network.Testnet]: AVAX_TESTNET_EXPLORER,
  [Network.Stagenet]: AVAX_MAINNET_EXPLORER,
}
// =====Explorers=====

// const avaxRootDerivationPaths = {
//   [Network.Mainnet]: `m/44'/9000'/0'/0/`,
//   [Network.Testnet]: `m/44'/9000'/0'/0/`,
//   [Network.Stagenet]: `m/44'/9000'/0'/0/`,
// }
const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}
const avaxParams: EVMClientParams = {
  chain: Chain.Avalanche,
  providers: ethersJSProviders,
  explorerProviders: avaxExplorerProviders,
  dataProviders: avaxProviders,
  network: Network.Testnet,
  phrase: process.env.PHRASE,
  feeBounds: {
    lower: 1,
    upper: 1,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
const client = new Client(avaxParams)

describe('xchain-evm (Avax) Integration Tests', () => {
  it('should fetch avax balances', async () => {
    const address = client.getAddress(0)
    console.log(address)
    const balances = await client.getBalance(address)
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch thorchain txs', async () => {
    const address = '0x55aEd0ce035883626e536254dda2F23a5b5D977f'
    const txPage = await client.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
})
