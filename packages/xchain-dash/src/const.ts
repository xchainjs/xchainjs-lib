import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { UtxoOnlineDataProviders } from '@xchainjs/xchain-utxo'
import { BlockcypherNetwork, BlockcypherProvider } from '@xchainjs/xchain-utxo-providers/lib'

/**
 * Minimum transaction fee
 * 1000 duff/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/dashpay/dash/blob/master/src/validation.h
 */
export const MIN_TX_FEE = 1000

export const DASH_DECIMAL = 8

export const LOWER_FEE_BOUND = 1
export const UPPER_FEE_BOUND = 500
export const DASH_SYMBOL = 'Đ'

export const DEFAULT_FEE_RATE = 1

/**
 * Chain identifier for Dash mainnet
 *
 */
export const DASHChain = 'DASH' as const

/**
 * Base "chain" asset on Dash main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetDASH: Asset = { chain: DASHChain, symbol: 'DASH', ticker: 'DASH', synth: false }

const DASH_MAINNET_EXPLORER = new ExplorerProvider(
  'https://insight.dash.org/insight',
  'https://insight.dash.org/insight/address/%%ADDRESS%%',
  'https://insight.dash.org/insight/tx/%%TX_ID%%',
)

const DASH_TESTNET_EXPLORER = new ExplorerProvider(
  'https://blockexplorer.one/dash/testnet/',
  'https://blockexplorer.one/dash/testnet/address/%%ADDRESS%%',
  'https://blockexplorer.one/dash/testnet/tx/%%TX_ID%%',
)

export const explorerProviders = {
  [Network.Testnet]: DASH_TESTNET_EXPLORER,
  [Network.Stagenet]: DASH_MAINNET_EXPLORER,
  [Network.Mainnet]: DASH_MAINNET_EXPLORER,
}

//======================
// Block Cypher
//======================

const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  DASHChain,
  AssetDASH,
  DASH_DECIMAL,
  BlockcypherNetwork.DASH,
)
export const BlockcypherDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}
