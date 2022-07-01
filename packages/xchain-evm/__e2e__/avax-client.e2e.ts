import { Network } from '@xchainjs/xchain-client'
import { AssetAVAX, Chain, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { Client, EVMClientParams } from '../src/client'
import { CovalentProvider } from '../src/providers/covalent/covalent-data-provider'
import { ExplorerProvider } from '../src/providers/explorer-provider'
import { IsApprovedParams } from '../src/types'

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
  gasAsset: AssetAVAX,
  gasAssetDecimals: 18,
  providers: ethersJSProviders,
  explorerProviders: avaxExplorerProviders,
  dataProviders: avaxProviders,
  network: Network.Testnet,
  phrase: process.env.PHRASE,
  feeBounds: {
    lower: 20000000000,
    upper: 100000000000,
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
  it('should fetch avax txs', async () => {
    const address = '0x55aEd0ce035883626e536254dda2F23a5b5D977f'
    const txPage = await client.getTransactions({ address })
    console.log(JSON.stringify(txPage, null, 2))
    expect(txPage.total).toBeGreaterThan(0)
    expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should estimate avax gasPrices', async () => {
    const gasPrices = await client.estimateGasPrices()
    console.log(JSON.stringify(gasPrices.average.amount(), null, 2))
    console.log(JSON.stringify(gasPrices.fast.amount(), null, 2))
    console.log(JSON.stringify(gasPrices.fastest.amount(), null, 2))
    // expect(txPage.total).toBeGreaterThan(0)
    // expect(txPage.txs.length).toBeGreaterThan(0)
  })
  it('should transfer 0.01 AVAX between wallet 0 and 1', async () => {
    const recipient = client.getAddress(1)
    const amount = assetToBase(assetAmount('0.01', 18))
    const txHash = await client.transfer({ amount, recipient })
    console.log(txHash)
  })
  it('should see if pagolin router isapproved for 1 RIP ', async () => {
    const params: IsApprovedParams = {
      contractAddress: '0x224695Ba2a98E4a096a519B503336E06D9116E48', //ERC20 address The Crypt (RIP)
      spenderAddress: '0x688d21b0b8dc35971af58cff1f7bf65639937860', //PangolinRouter contract on testnet
      amount: assetToBase(assetAmount('1', 18)),
    }
    const isApproved = await client.isApproved(params)
    console.log(isApproved)
  })
})
