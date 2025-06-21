import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  BlockcypherNetwork,
  BlockcypherProvider,
  HaskoinNetwork,
  HaskoinProvider,
  SochainNetwork,
  SochainProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'

/**
 * Minimum transaction fee
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
export const MIN_TX_FEE = 1000

// Decimal places for Bitcoin
export const BTC_DECIMAL = 8

// Lower and upper bounds for fee rates
export const LOWER_FEE_BOUND = 1
export const UPPER_FEE_BOUND = 1_000

// Symbols for Bitcoin
export const BTC_SYMBOL = '₿'
export const BTC_SATOSHI_SYMBOL = '⚡'

/**
 * Chain identifier for Bitcoin mainnet
 */
export const BTCChain = 'BTC' as const

/**
 * Base "chain" asset on bitcoin main net.
 */
export const AssetBTC: Asset = { chain: BTCChain, symbol: 'BTC', ticker: 'BTC', type: AssetType.NATIVE }

// Explorer providers for Bitcoin
const BTC_MAINNET_EXPLORER = new ExplorerProvider(
  'https://blockstream.info/',
  'https://blockstream.info/address/%%ADDRESS%%',
  'https://blockstream.info/tx/%%TX_ID%%',
)
const BTC_TESTNET_EXPLORER = new ExplorerProvider(
  'https://blockstream.info/testnet/',
  'https://blockstream.info/testnet/address/%%ADDRESS%%',
  'https://blockstream.info/testnet/tx/%%TX_ID%%',
)
export const blockstreamExplorerProviders = {
  [Network.Testnet]: BTC_TESTNET_EXPLORER,
  [Network.Stagenet]: BTC_MAINNET_EXPLORER,
  [Network.Mainnet]: BTC_MAINNET_EXPLORER,
}

// Sochain data providers for Bitcoin
const testnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env.SOCHAIN_API_KEY || '',
  BTCChain,
  AssetBTC,
  8,
  SochainNetwork.BTCTEST,
)
const mainnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env.SOCHAIN_API_KEY || '',
  BTCChain,
  AssetBTC,
  8,
  SochainNetwork.BTC,
)
export const SochainDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetSochainProvider,
  [Network.Stagenet]: mainnetSochainProvider,
  [Network.Mainnet]: mainnetSochainProvider,
}

// Haskoin data providers for Bitcoin
const testnetHaskoinProvider = new HaskoinProvider(
  'https://api.haskoin.com',
  BTCChain,
  AssetBTC,
  8,
  HaskoinNetwork.BTCTEST,
)
const mainnetHaskoinProvider = new HaskoinProvider('https://api.haskoin.com', BTCChain, AssetBTC, 8, HaskoinNetwork.BTC)
export const HaskoinDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetHaskoinProvider,
  [Network.Stagenet]: mainnetHaskoinProvider,
  [Network.Mainnet]: mainnetHaskoinProvider,
}

// Blockcypher data providers for Bitcoin
const testnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  BTCChain,
  AssetBTC,
  8,
  BlockcypherNetwork.BTCTEST,
  process.env.BLOCKCYPHER_API_KEY || '',
)
const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  BTCChain,
  AssetBTC,
  8,
  BlockcypherNetwork.BTC,
  process.env.BLOCKCYPHER_API_KEY || '',
)
export const BlockcypherDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetBlockcypherProvider,
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}

// Bitgo data providers for Bitcoin
const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: BTCChain,
})
export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}

export const tapRootDerivationPaths = {
  [Network.Mainnet]: `m/86'/0'/0'/0/`,
  [Network.Testnet]: `m/86'/1'/0'/0/`,
  [Network.Stagenet]: `m/86'/0'/0'/0/`,
}
