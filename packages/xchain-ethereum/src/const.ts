import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { EtherscanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

export const LOWER_FEE_BOUND = 2_000_000_000
export const UPPER_FEE_BOUND = 1_000_000_000_000

export const ETH_GAS_ASSET_DECIMAL = 18

export const ETHChain = 'ETH' as const

export const AssetETH: Asset = {
  chain: ETHChain,
  symbol: 'ETH',
  ticker: 'ETH',
  synth: false,
}

// =====Ethers providers=====
const ETH_MAINNET_ETHERS_PROVIDER = new ethers.providers.EtherscanProvider('homestead', process.env.ETHERSCAN_API_KEY)
// as per https://docs.ethers.org/v5/api/providers/api-providers/#EtherscanProvider
const network = ethers.providers.getNetwork('sepolia')
const ETH_TESTNET_ETHERS_PROVIDER = new ethers.providers.EtherscanProvider(network, process.env.ETHERSCAN_API_KEY)

const ethersJSProviders = {
  [Network.Mainnet]: ETH_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: ETH_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: ETH_MAINNET_ETHERS_PROVIDER,
}
// =====Ethers providers=====

// =====ONLINE providers=====
const ETH_ONLINE_PROVIDER_TESTNET = new EtherscanProvider(
  ETH_TESTNET_ETHERS_PROVIDER,
  'https://api-sepolia.etherscan.io/',
  process.env.ETHERSCAN_API_KEY || '',
  ETHChain,
  AssetETH,
  ETH_GAS_ASSET_DECIMAL,
)

const ETH_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  ETH_MAINNET_ETHERS_PROVIDER,
  'https://api.etherscan.io/',
  process.env.ETHERSCAN_API_KEY || '',
  ETHChain,
  AssetETH,
  ETH_GAS_ASSET_DECIMAL,
)
const ethProviders = {
  [Network.Mainnet]: ETH_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: ETH_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: ETH_ONLINE_PROVIDER_MAINNET,
}
// =====ONLINE providers=====

// =====Explorers=====
const ETH_MAINNET_EXPLORER = new ExplorerProvider(
  'https://etherscan.io',
  'https://etherscan.io/address/%%ADDRESS%%',
  'https://etherscan.io/tx/%%TX_ID%%',
)
const ETH_TESTNET_EXPLORER = new ExplorerProvider(
  'https://sepolia.etherscan.io/',
  'https://sepolia.etherscan.io/address/%%ADDRESS%%',
  'https://sepolia.etherscan.io/tx/%%TX_ID%%',
)
const ethExplorerProviders = {
  [Network.Mainnet]: ETH_MAINNET_EXPLORER,
  [Network.Testnet]: ETH_TESTNET_EXPLORER,
  [Network.Stagenet]: ETH_MAINNET_EXPLORER,
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

export const defaultEthParams: EVMClientParams = {
  chain: ETHChain,
  gasAsset: AssetETH,
  gasAssetDecimals: ETH_GAS_ASSET_DECIMAL,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: ethExplorerProviders,
  dataProviders: [ethProviders],
  network: Network.Testnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: ethRootDerivationPaths,
}
