// Import necessary modules and classes from external packages and files
import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProviderV2, RoutescanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import { JsonRpcProvider } from 'ethers'
import { BigNumber } from 'bignumber.js'

// Define constants related to Avalanche
export const AVAX_DECIMAL = 18
export const LOWER_FEE_BOUND = 2_000_000_000
export const UPPER_FEE_BOUND = 1_000_000_000_000
export const AVAX_GAS_ASSET_DECIMAL = 18
export const AVAXChain = 'AVAX' as const
export const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', type: AssetType.NATIVE }

// Ankr api key
const ankrApiKey = process.env.ANKR_API_KEY

// Define JSON-RPC providers for mainnet and testnet
const AVALANCHE_MAINNET_ETHERS_PROVIDER = new JsonRpcProvider(`https://rpc.ankr.com/avalanche/${ankrApiKey}`, {
  name: 'avalanche',
  chainId: 43114,
})
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new JsonRpcProvider(`https://rpc.ankr.com/avalanche_fuji/${ankrApiKey}`, {
  name: 'fuji',
  chainId: 43113,
})

// Define ethers providers for different networks
const ethersJSProviders = {
  [Network.Mainnet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: AVALANCHE_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
}

// Define online providers (Etherscan) for mainnet and testnet
const AVAX_ONLINE_PROVIDER_TESTNET = new EtherscanProviderV2(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  AVAXChain,
  AssetAVAX,
  18,
  43113,
)
const AVAX_ONLINE_PROVIDER_MAINNET = new EtherscanProviderV2(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  AVAXChain,
  AssetAVAX,
  18,
  43114,
)

// Define providers for different networks
const avaxProviders = {
  [Network.Mainnet]: AVAX_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: AVAX_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: AVAX_ONLINE_PROVIDER_MAINNET,
}

// Define Routescan providers for mainnet and testnet
const ROUTESCAN_PROVIDER_MAINNET = new RoutescanProvider(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.routescan.io',
  43114,
  AssetAVAX,
  AVAX_DECIMAL,
)

const ROUTESCAN_PROVIDER_TESTNET = new RoutescanProvider(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api.routescan.io',
  43113,
  AssetAVAX,
  AVAX_DECIMAL,
  true,
)

// Define Routescan providers for different networks
const routescanProviders = {
  [Network.Mainnet]: ROUTESCAN_PROVIDER_MAINNET,
  [Network.Testnet]: ROUTESCAN_PROVIDER_TESTNET,
  [Network.Stagenet]: ROUTESCAN_PROVIDER_MAINNET,
}

// Define explorer providers for mainnet and testnet
const AVAX_MAINNET_EXPLORER = new ExplorerProvider(
  'https://snowtrace.dev/',
  'https://snowtrace.dev/address/%%ADDRESS%%',
  'https://snowtrace.dev/tx/%%TX_ID%%',
)
const AVAX_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.snowtrace.dev/',
  'https://testnet.snowtrace.dev/address/%%ADDRESS%%',
  'https://testnet.snowtrace.dev/tx/%%TX_ID%%',
)

// Define explorer providers for different networks
const avaxExplorerProviders = {
  [Network.Mainnet]: AVAX_MAINNET_EXPLORER,
  [Network.Testnet]: AVAX_TESTNET_EXPLORER,
  [Network.Stagenet]: AVAX_MAINNET_EXPLORER,
}

// Define root derivation paths for different networks
const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}

// Define default parameters for the Avalanche client
const defaults = {
  [Network.Mainnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
}

// Define the default parameters for the Avalanche client
export const defaultAvaxParams: EVMClientParams = {
  chain: AVAXChain,
  gasAsset: AssetAVAX,
  gasAssetDecimals: AVAX_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: avaxExplorerProviders,
  dataProviders: [avaxProviders, routescanProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
