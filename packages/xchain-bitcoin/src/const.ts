import { ExplorerProvider, Network, UtxoOnlineDataProviders } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import {
  BlockcypherNetwork,
  BlockcypherProvider,
  HaskoinNetwork,
  HaskoinProvider,
  SochainNetwork,
  SochainProvider,
} from '@xchainjs/xchain-utxo-providers'

/**
 * Minimum transaction fee
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
export const MIN_TX_FEE = 1000

export const BTC_DECIMAL = 8

export const LOWER_FEE_BOUND = 1
export const UPPER_FEE_BOUND = 500
export const BTC_SYMBOL = '₿'
export const BTC_SATOSHI_SYMBOL = '⚡'

/**
 * Chain identifier for Bitcoin mainnet
 *
 */
export const BTCChain = 'BTC' as const

/**
 * Base "chain" asset on bitcoin main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetBTC: Asset = { chain: BTCChain, symbol: 'BTC', ticker: 'BTC', synth: false }

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
//======================
// sochain
//======================

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
export const sochainDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetSochainProvider,
  [Network.Stagenet]: mainnetSochainProvider,
  [Network.Mainnet]: mainnetSochainProvider,
}
//======================
// haskoin
//======================
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
//======================
// Blockcypher
//======================
const testnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  BTCChain,
  AssetBTC,
  8,
  BlockcypherNetwork.BTCTEST,
)

const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  BTCChain,
  AssetBTC,
  8,
  BlockcypherNetwork.BTC,
)
export const BlockcypherDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetBlockcypherProvider,
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}
