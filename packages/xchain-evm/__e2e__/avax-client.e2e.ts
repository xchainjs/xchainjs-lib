import { Network } from '@xchainjs/xchain-client'
import { Chain, assetToString } from '@xchainjs/xchain-util'
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
const AVAX_ONLINE_PROVIDER_MAINNET = new CovalentProvider(process.env.COVALENT_API_KEY || '', Chain.Avalanche, 43114)
const AVAX_ONLINE_PROVIDER_TESTNET = new CovalentProvider(process.env.COVALENT_API_KEY || '', Chain.Avalanche, 43113)
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

const rootDerivationPaths = {
  [Network.Mainnet]: `m/44'/9000'/0'/0/`,
  [Network.Testnet]: `m/44'/9000'/0'/0/`,
  [Network.Stagenet]: `m/44'/9000'/0'/0/`,
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
  rootDerivationPaths,
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
    const address = client.getAddress(0)
    const txPage = await client.getTransactions({ address })
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
})
