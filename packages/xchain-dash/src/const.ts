import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  BlockcypherNetwork,
  BlockcypherProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'

/**
 * Minimum transaction fee in duff/kB.
 * Currently set to 1000 duff/kB, similar to the current `minrelaytxfee`.
 * @see https://github.com/dashpay/dash/blob/master/src/validation.h
 */
export const MIN_TX_FEE = 1000

/**
 * The decimal precision for Dash.
 */
export const DASH_DECIMAL = 8

/**
 * Lower bound for the transaction fee.
 */
export const LOWER_FEE_BOUND = 1

/**
 * Upper bound for the transaction fee.
 */
export const UPPER_FEE_BOUND = 500

/**
 * Symbol for Dash.
 */
export const DASH_SYMBOL = 'Đ'
export const DEFAULT_FEE_RATE = 1

/**
 * Chain identifier for Dash mainnet.
 */
export const DASHChain = 'DASH' as const

/**
 * Base "chain" asset on Dash mainnet.
 * Definition based on Thorchain common asset.
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetDASH: Asset = { chain: DASHChain, symbol: 'DASH', ticker: 'DASH', synth: false }

/**
 * Explorer provider for Dash mainnet.
 */
const DASH_MAINNET_EXPLORER = new ExplorerProvider(
  'https://insight.dash.org/insight',
  'https://insight.dash.org/insight/address/%%ADDRESS%%',
  'https://insight.dash.org/insight/tx/%%TX_ID%%',
)

/**
 * Explorer provider for Dash testnet.
 */
const DASH_TESTNET_EXPLORER = new ExplorerProvider(
  'https://blockexplorer.one/dash/testnet/',
  'https://blockexplorer.one/dash/testnet/address/%%ADDRESS%%',
  'https://blockexplorer.one/dash/testnet/tx/%%TX_ID%%',
)

/**
 * Explorer providers for different Dash networks.
 */
export const explorerProviders = {
  [Network.Testnet]: DASH_TESTNET_EXPLORER,
  [Network.Stagenet]: DASH_MAINNET_EXPLORER,
  [Network.Mainnet]: DASH_MAINNET_EXPLORER,
}

// Block Cypher

/**
 * Blockcypher provider for Dash mainnet.
 */
const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  DASHChain,
  AssetDASH,
  DASH_DECIMAL,
  BlockcypherNetwork.DASH,
)

/**
 * Data providers for Blockcypher.
 */
export const BlockcypherDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}

// Bitgo

/**
 * Bitgo provider for Dash mainnet.
 */
const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: DASHChain,
})

/**
 * Data providers for Bitgo.
 */
export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
