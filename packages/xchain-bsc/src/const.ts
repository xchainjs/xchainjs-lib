import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

export const LOWER_FEE_BOUND = 2_000_000_000
export const UPPER_FEE_BOUND = 1_000_000_000_000

export const BSC_GAS_ASSET_DECIMAL = 18

/**
 * Chain identifier for BSC.
 *
 */
export const BSCChain = 'BSC' as const

/**
 * Base "chain" asset of Binance smart chain.
 *
 */
export const AssetBSC: Asset = {
  chain: BSCChain,
  symbol: 'BNB',
  ticker: 'BNB',
  synth: false,
}

// =====Ethers providers=====
const BSC_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc')
const BSC_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://bsc-testnet.public.blastapi.io')

const ethersJSProviders = {
  [Network.Mainnet]: BSC_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: BSC_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: BSC_MAINNET_ETHERS_PROVIDER,
}
// =====Ethers providers=====

// =====ONLINE providers=====
const BSC_ONLINE_PROVIDER_TESTNET = new EtherscanProvider(
  BSC_TESTNET_ETHERS_PROVIDER,
  'https://api-testnet.bscscan.com',
  process.env['BSCCHAIN_API_KEY'] || '',
  BSCChain,
  AssetBSC,
  BSC_GAS_ASSET_DECIMAL,
)
const BSC_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  BSC_MAINNET_ETHERS_PROVIDER,
  'https://api.bscscan.com',
  process.env['BSCCHAIN_API_KEY'] || '',
  BSCChain,
  AssetBSC,
  BSC_GAS_ASSET_DECIMAL,
)
const bscProviders = {
  [Network.Mainnet]: BSC_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: BSC_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: BSC_ONLINE_PROVIDER_MAINNET,
}
// =====ONLINE providers=====

// =====Explorers=====
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
// =====Explorers=====

const ethRootDerivationPaths = {
  [Network.Mainnet]: "m/44'/60'/0'/0/",
  [Network.Testnet]: "m/44'/60'/0'/0/",
  [Network.Stagenet]: "m/44'/60'/0'/0/",
}

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

export const defaultBscParams: EVMClientParams = {
  chain: BSCChain,
  gasAsset: AssetBSC,
  gasAssetDecimals: BSC_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: bscExplorerProviders,
  dataProviders: [bscProviders],
  network: Network.Testnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
