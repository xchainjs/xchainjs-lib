import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

export const ARB_DECIMAL = 18

export const LOWER_FEE_BOUND = 2_000_000_000
export const UPPER_FEE_BOUND = 1_000_000_000_000

export const ARB_GAS_ASSET_DECIMAL = 18

/**
 * Chain identifier for ARB.
 *
 */
export const ARBChain = 'ARB' as const

/**
 * Base "chain" asset of Arbitrum chain.
 *
 */
export const AssetARB: Asset = { chain: ARBChain, symbol: 'ARB', ticker: 'ETH', synth: false }

// =====Ethers providers=====
const ARBITRUM_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc')
const ARBITRUM_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')

const ethersJSProviders = {
  [Network.Mainnet]: ARBITRUM_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: ARBITRUM_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: ARBITRUM_MAINNET_ETHERS_PROVIDER,
}
// =====Ethers providers=====
// =====ONLINE providers=====

const ARB_ONLINE_PROVIDER_TESTNET = new EtherscanProvider(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api-goerli.arbiscan.io,
  process.env['ARBISCAN_API_KEY'] || '',
  ARBChain,
  AssetARB,
  18,
)
const ARB_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.arbiscan.io',
  process.env['ARBISCAN_API_KEY'] || '',
  ARBChain,
  AssetARB,
  18,
)
const arbProviders = {
  [Network.Mainnet]: ARB_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: ARB_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: ARB_ONLINE_PROVIDER_MAINNET,
}
// =====ONLINE providers=====

// =====Explorers=====
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
const arbExplorerProviders = {
  [Network.Mainnet]: ARB_MAINNET_EXPLORER,
  [Network.Testnet]: ARB_TESTNET_EXPLORER,
  [Network.Stagenet]: ARB_MAINNET_EXPLORER,
}
// =====Explorers=====

const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}

const defaults = {
  [Network.Mainnet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30),
  },
  [Network.Testnet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30),
  },
  [Network.Stagenet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30),
  },
}
export const defaultArbParams: EVMClientParams = {
  chain: ARBChain,
  gasAsset: AssetARB,
  gasAssetDecimals: ARB_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: arbExplorerProviders,
  dataProviders: [arbProviders],
  network: Network.Testnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
