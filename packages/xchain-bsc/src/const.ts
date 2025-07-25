/**
 * Module providing configuration parameters and providers for the Binance Smart Chain (BSC) client.
 */
import { ExplorerProvider, Network } from '@xchainjs/xchain-client' // Importing ExplorerProvider and Network from xchain-client
import { EVMClientParams } from '@xchainjs/xchain-evm' // Importing EVMClientParams from xchain-evm
import { EtherscanProviderV2 } from '@xchainjs/xchain-evm-providers' // Importing EtherscanProvider from xchain-evm-providers
import { Asset, AssetType } from '@xchainjs/xchain-util' // Importing Asset from xchain-util
import { JsonRpcProvider } from 'ethers'
import BigNumber from 'bignumber.js'

/**
 * Lower fee bound for BSC transactions.
 */
export const LOWER_FEE_BOUND = 99000000
/**
 * Upper fee bound for BSC transactions.
 */
export const UPPER_FEE_BOUND = 1_000_000_000_000

/**
 * Decimal precision for BSC gas asset.
 */
export const BSC_GAS_ASSET_DECIMAL = 18

/**
 * Chain identifier for Binance Smart Chain (BSC).
 */
export const BSCChain = 'BSC' as const

/**
 * Base "chain" asset of Binance Smart Chain (BSC).
 */
export const AssetBSC: Asset = {
  chain: BSCChain,
  symbol: 'BNB',
  ticker: 'BNB',
  type: AssetType.NATIVE,
}
// Ankr api key
const ankrApiKey = process.env.ANKR_API_KEY

// Ethers providers
const BSC_MAINNET_ETHERS_PROVIDER = new JsonRpcProvider(`https://rpc.ankr.com/bsc/${ankrApiKey}`)
const BSC_TESTNET_ETHERS_PROVIDER = new JsonRpcProvider('https://bsc-testnet.public.blastapi.io')

const ethersJSProviders = {
  [Network.Mainnet]: BSC_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: BSC_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: BSC_MAINNET_ETHERS_PROVIDER,
}

// ONLINE providers
const BSC_ONLINE_PROVIDER_TESTNET = new EtherscanProviderV2(
  BSC_TESTNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  BSCChain,
  AssetBSC,
  BSC_GAS_ASSET_DECIMAL,
  97,
)
const BSC_ONLINE_PROVIDER_MAINNET = new EtherscanProviderV2(
  BSC_MAINNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/v2',
  process.env.ETHERSCAN_API_KEY || '',
  BSCChain,
  AssetBSC,
  BSC_GAS_ASSET_DECIMAL,
  56,
)
const bscProviders = {
  [Network.Mainnet]: BSC_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: BSC_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: BSC_ONLINE_PROVIDER_MAINNET,
}

// Explorers
const BSC_MAINNET_EXPLORER = new ExplorerProvider(
  'https://bscscan.com/',
  'https://bscscan.com/address/%%ADDRESS%%',
  'https://bscscan.com/tx/%%TX_ID%%',
)
const BSC_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.bscscan.com/',
  'https://testnet.bscscan.com/address/%%ADDRESS%%',
  'https://testnet.bscscan.com/tx/%%TX_ID%%',
)
const bscExplorerProviders = {
  [Network.Mainnet]: BSC_MAINNET_EXPLORER,
  [Network.Testnet]: BSC_TESTNET_EXPLORER,
  [Network.Stagenet]: BSC_MAINNET_EXPLORER,
}

// Default parameters
const ethRootDerivationPaths = {
  [Network.Mainnet]: "m/44'/60'/0'/0/",
  [Network.Testnet]: "m/44'/60'/0'/0/",
  [Network.Stagenet]: "m/44'/60'/0'/0/",
}
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

/**
 * Default parameters for the BSC client.
 */
export const defaultBscParams: EVMClientParams = {
  chain: BSCChain,
  gasAsset: AssetBSC,
  gasAssetDecimals: BSC_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: bscExplorerProviders,
  dataProviders: [bscProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
