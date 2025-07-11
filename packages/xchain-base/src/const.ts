// Import necessary modules and classes from external packages and files
import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProviderV2 } from '@xchainjs/xchain-evm-providers'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import { JsonRpcProvider } from 'ethers'
import BigNumber from 'bignumber.js'

// Define constants related to Base
export const BASE_DECIMAL = 18
export const LOWER_FEE_BOUND = 1_000_000
export const UPPER_FEE_BOUND = 1_000_000_000
export const BASE_GAS_ASSET_DECIMAL = 18
export const BASEChain = 'BASE' as const
// BASE ETH Gas asset
export const AssetBETH: Asset = { chain: BASEChain, symbol: 'ETH', ticker: 'ETH', type: AssetType.NATIVE }

// Define JSON-RPC providers for mainnet and testnet
const BASE_MAINNET_ETHERS_PROVIDER = new JsonRpcProvider('https://1rpc.io/base')
const BASE_TESTNET_ETHERS_PROVIDER = new JsonRpcProvider('https://base-sepolia-rpc.publicnode.com')

// Define ethers providers for different networks
const ethersJSProviders = {
  [Network.Mainnet]: BASE_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: BASE_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: BASE_MAINNET_ETHERS_PROVIDER,
}

// Define online providers (Etherscan) for mainnet and testnet
const BASE_ONLINE_PROVIDER_MAINNET = new EtherscanProviderV2(
  BASE_MAINNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  BASEChain,
  AssetBETH,
  18,
  8453,
)

const BASE_ONLINE_PROVIDER_TESTNET = new EtherscanProviderV2(
  BASE_TESTNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  BASEChain,
  AssetBETH,
  18,
  84532,
)

// Define providers for different networks
const baseProviders = {
  [Network.Mainnet]: BASE_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: BASE_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: BASE_ONLINE_PROVIDER_MAINNET,
}

// Define explorer providers for mainnet and testnet
const BASE_MAINNET_EXPLORER = new ExplorerProvider(
  'https://basescan.org/',
  'https://basescan.org/address/%%ADDRESS%%',
  'https://basescan.org/tx/%%TX_ID%%',
)

const BASE_TESTNET_EXPLORER = new ExplorerProvider(
  'https://sepolia.basescan.org',
  'https://sepolia.basescan.org/address/%%ADDRESS%%',
  'https://sepolia.basescan.org/tx/%%TX_ID%%',
)

// Define explorer providers for different networks
const baseExplorerProviders = {
  [Network.Mainnet]: BASE_MAINNET_EXPLORER,
  [Network.Testnet]: BASE_TESTNET_EXPLORER,
  [Network.Stagenet]: BASE_MAINNET_EXPLORER,
}

// Define root derivation paths for different networks
const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}

// Define default parameters for the Base client
// TODO: not sure
const defaults = {
  [Network.Mainnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(0.03 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(0.03 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(0.2 * 10 ** 9),
  },
}

// Define the default parameters for the Base client
export const defaultBaseParams: EVMClientParams = {
  chain: BASEChain,
  gasAsset: AssetBETH,
  gasAssetDecimals: BASE_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: baseExplorerProviders,
  dataProviders: [baseProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
