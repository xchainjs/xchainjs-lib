import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProviderV2 } from '@xchainjs/xchain-evm-providers'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

/**
 * Constants for fee bounds in Gwei.
 */
export const LOWER_FEE_BOUND = 2_000_000_000
export const UPPER_FEE_BOUND = 1_000_000_000_000

/**
 * Decimal places for Ethereum gas asset.
 */
export const ETH_GAS_ASSET_DECIMAL = 18

/**
 * Chain identifier for Ethereum.
 */
export const ETHChain = 'ETH' as const

/**
 * Ethereum asset information.
 */
export const AssetETH: Asset = {
  chain: ETHChain,
  symbol: 'ETH',
  ticker: 'ETH',
  type: AssetType.NATIVE,
}

// ===== Ethers providers =====
const ETH_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com', 'homestead')
const network = ethers.providers.getNetwork('sepolia')
const ETH_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider(
  'https://ethereum-sepolia-rpc.publicnode.com',
  network,
)

// Object to map network to ethers providers
const ethersJSProviders = {
  [Network.Mainnet]: ETH_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: ETH_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: ETH_MAINNET_ETHERS_PROVIDER,
}
// ===== Ethers providers =====

// ===== ONLINE providers =====
// Testnet online provider
const ETH_ONLINE_PROVIDER_TESTNET = new EtherscanProviderV2(
  ETH_TESTNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  ETHChain,
  AssetETH,
  ETH_GAS_ASSET_DECIMAL,
  11155111,
)
// Mainnet online provider
const ETH_ONLINE_PROVIDER_MAINNET = new EtherscanProviderV2(
  ETH_MAINNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  ETHChain,
  AssetETH,
  ETH_GAS_ASSET_DECIMAL,
  1,
)
// Object to map network to online providers
const ethProviders = {
  [Network.Mainnet]: ETH_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: ETH_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: ETH_ONLINE_PROVIDER_MAINNET,
}
// ===== ONLINE providers =====

// ===== Explorers =====
// Mainnet explorer provider
const ETH_MAINNET_EXPLORER = new ExplorerProvider(
  'https://etherscan.io',
  'https://etherscan.io/address/%%ADDRESS%%',
  'https://etherscan.io/tx/%%TX_ID%%',
)
// Testnet explorer provider
const ETH_TESTNET_EXPLORER = new ExplorerProvider(
  'https://sepolia.etherscan.io/',
  'https://sepolia.etherscan.io/address/%%ADDRESS%%',
  'https://sepolia.etherscan.io/tx/%%TX_ID%%',
)
// Object to map network to explorer providers
const ethExplorerProviders = {
  [Network.Mainnet]: ETH_MAINNET_EXPLORER,
  [Network.Testnet]: ETH_TESTNET_EXPLORER,
  [Network.Stagenet]: ETH_MAINNET_EXPLORER,
}
// ===== Explorers =====

/**
 * Root derivation paths for Ethereum networks.
 */
const ethRootDerivationPaths = {
  [Network.Mainnet]: "m/44'/60'/0'/0/",
  [Network.Testnet]: "m/44'/60'/0'/0/",
  [Network.Stagenet]: "m/44'/60'/0'/0/",
}

/**
 * Default parameters for Ethereum clients.
 */
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

/**
 * Default Ethereum client parameters.
 */
export const defaultEthParams: EVMClientParams = {
  chain: ETHChain,
  gasAsset: AssetETH,
  gasAssetDecimals: ETH_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: ethExplorerProviders,
  dataProviders: [ethProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
