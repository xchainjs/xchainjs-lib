// Import necessary modules and classes from external packages and files
import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProvider, RoutescanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

// Define constants related to Avalanche
export const AVAX_DECIMAL = 18
export const LOWER_FEE_BOUND = 2_000_000_000
export const UPPER_FEE_BOUND = 1_000_000_000_000
export const AVAX_GAS_ASSET_DECIMAL = 18
export const AVAXChain = 'AVAX' as const
export const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', synth: false }

// Define JSON-RPC providers for mainnet and testnet
const AVALANCHE_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/avalanche')
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/avalanche_fuji')

// Define ethers providers for different networks
const ethersJSProviders = {
  [Network.Mainnet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: AVALANCHE_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
}

// Define online providers (Etherscan) for mainnet and testnet
const AVAX_ONLINE_PROVIDER_TESTNET = new EtherscanProvider(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api-testnet.snowtrace.io',
  process.env.SNOWTRACE_API_KEY || '',
  AVAXChain,
  AssetAVAX,
  18,
)
const AVAX_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.snowtrace.io',
  process.env.SNOWTRACE_API_KEY || '',
  AVAXChain,
  AssetAVAX,
  18,
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
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30 * 10 ** 9),
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
