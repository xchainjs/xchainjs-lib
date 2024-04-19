// Import necessary modules and classes from external packages and files
import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

// Define constants related to Arbitrum
export const ARB_DECIMAL = 18
export const LOWER_FEE_BOUND = 100_000_000
export const UPPER_FEE_BOUND = 1_000_000_000
export const ARB_GAS_ASSET_DECIMAL = 18
export const ARBChain = 'ARB' as const
// ARB ETH Gas asset
export const AssetAETH: Asset = { chain: ARBChain, symbol: 'ETH', ticker: 'ETH', synth: false }

// ARB
export const AssetARB: Asset = {
  chain: ARBChain,
  symbol: 'ARB-0x912ce59144191c1204e64559fe8253a0e49e6548',
  ticker: 'ARB',
  synth: false,
}

// Define JSON-RPC providers for mainnet and testnet
const ARBITRUM_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc')
const ARBITRUM_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')

// Define ethers providers for different networks
const ethersJSProviders = {
  [Network.Mainnet]: ARBITRUM_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: ARBITRUM_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: ARBITRUM_MAINNET_ETHERS_PROVIDER,
}

// Define online providers (Etherscan) for mainnet and testnet
const ARB_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  ARBITRUM_MAINNET_ETHERS_PROVIDER,
  'https://api.arbiscan.io',
  process.env.ARBISCAN_API_KEY || '',
  ARBChain,
  AssetAETH,
  18,
)

const ARB_ONLINE_PROVIDER_TESTNET = new EtherscanProvider(
  ARBITRUM_TESTNET_ETHERS_PROVIDER,
  'https://api-goerli.arbiscan.io',
  process.env.ARBISCAN_API_KEY || '',
  ARBChain,
  AssetAETH,
  18,
)

// Define providers for different networks
const arbProviders = {
  [Network.Mainnet]: ARB_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: ARB_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: ARB_ONLINE_PROVIDER_MAINNET,
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
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(0.2 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(0.2 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(0.2 * 10 ** 9),
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
  dataProviders: [arbProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
