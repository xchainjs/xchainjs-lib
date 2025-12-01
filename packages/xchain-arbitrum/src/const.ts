// Import necessary modules and classes from external packages and files
import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { RoutescanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset, AssetType, TokenAsset } from '@xchainjs/xchain-util'
import { JsonRpcProvider } from 'ethers'
import BigNumber from 'bignumber.js'

// Define constants related to Arbitrum
export const ARB_DECIMAL = 18
export const LOWER_FEE_BOUND = 100_000_00
export const UPPER_FEE_BOUND = 1_000_000_000
export const ARB_GAS_ASSET_DECIMAL = 18
export const ARBChain = 'ARB' as const
// ARB ETH Gas asset
export const AssetAETH: Asset = { chain: ARBChain, symbol: 'ETH', ticker: 'ETH', type: AssetType.NATIVE }

// ARB
export const AssetARB: TokenAsset = {
  chain: ARBChain,
  symbol: 'ARB-0x912ce59144191c1204e64559fe8253a0e49e6548',
  ticker: 'ARB',
  type: AssetType.TOKEN,
}

// Define JSON-RPC providers for mainnet and testnet
const ARBITRUM_MAINNET_ETHERS_PROVIDER = new JsonRpcProvider('https://arb1.arbitrum.io/rpc')
const ARBITRUM_TESTNET_ETHERS_PROVIDER = new JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')

// Define ethers providers for different networks
const ethersJSProviders = {
  [Network.Mainnet]: ARBITRUM_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: ARBITRUM_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: ARBITRUM_MAINNET_ETHERS_PROVIDER,
}

// Etherscan providers removed - Etherscan's gas oracle doesn't support Arbitrum

const ROUTESCAN_PROVIDER_MAINNET = new RoutescanProvider(
  ARBITRUM_MAINNET_ETHERS_PROVIDER,
  'https://api.routescan.io',
  42161,
  AssetAETH,
  ARB_DECIMAL,
)

const ROUTESCAN_PROVIDER_TESTNET = new RoutescanProvider(
  ARBITRUM_TESTNET_ETHERS_PROVIDER,
  'https://api.routescan.io',
  421614,
  AssetAETH,
  ARB_DECIMAL,
  true,
)

const routescanProviders = {
  [Network.Mainnet]: ROUTESCAN_PROVIDER_MAINNET,
  [Network.Testnet]: ROUTESCAN_PROVIDER_TESTNET,
  [Network.Stagenet]: ROUTESCAN_PROVIDER_MAINNET,
}

// Define explorer providers for mainnet and testnet
const ARB_MAINNET_EXPLORER = new ExplorerProvider(
  'https://arbiscan.io/',
  'https://arbiscan.io/address/%%ADDRESS%%',
  'https://arbiscan.io/tx/%%TX_ID%%',
)

const ARB_TESTNET_EXPLORER = new ExplorerProvider(
  'https://goerli.arbiscan.io',
  'https://goerli.arbiscan.io/address/%%ADDRESS%%',
  'https://goerli.arbiscan.io/tx/%%TX_ID%%',
)

// Define explorer providers for different networks
const arbExplorerProviders = {
  [Network.Mainnet]: ARB_MAINNET_EXPLORER,
  [Network.Testnet]: ARB_TESTNET_EXPLORER,
  [Network.Stagenet]: ARB_MAINNET_EXPLORER,
}

// Define root derivation paths for different networks
const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}

// Define default parameters for the Arbitrum client
const defaults = {
  [Network.Mainnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(0.2 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(0.2 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(0.2 * 10 ** 9),
  },
}

// Define the default parameters for the Arbitrum client
export const defaultArbParams: EVMClientParams = {
  chain: ARBChain,
  gasAsset: AssetAETH,
  gasAssetDecimals: ARB_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: arbExplorerProviders,
  dataProviders: [routescanProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
