import { Network } from '@xchainjs/xchain-client'
import { EVMClientParams, EtherscanProvider, ExplorerProvider } from '@xchainjs/xchain-evm'
import { AssetAVAX, Chain } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

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

const AVAX_ONLINE_PROVIDER_TESTNET = new EtherscanProvider(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api-testnet.snowtrace.io',
  'fake',
  Chain.Avalanche,
  AssetAVAX,
  18,
)
const AVAX_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.snowtrace.io',
  'fake',
  Chain.Avalanche,
  AssetAVAX,
  18,
)
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

const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}
export const defaultAvaxParams: EVMClientParams = {
  chain: Chain.Avalanche,
  gasAsset: AssetAVAX,
  gasAssetDecimals: 18,
  defaults: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(21000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(50),
  },
  providers: ethersJSProviders,
  explorerProviders: avaxExplorerProviders,
  dataProviders: avaxProviders,
  network: Network.Testnet,
  phrase: process.env.PHRASE,
  feeBounds: {
    lower: 20000000000,
    upper: 260000000000,
    //  234000000000
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
