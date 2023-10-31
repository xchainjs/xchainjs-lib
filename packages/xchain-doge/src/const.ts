import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import {
  BlockcypherNetwork,
  BlockcypherProvider,
  SochainNetwork,
  SochainProvider,
} from '@xchainjs/xchain-utxo-providers'
/**
 * Minimum transaction fee
 * 100000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/dogecoin/dogecoin/blob/master/src/validation.h#L58
 */
export const MIN_TX_FEE = 100000
export const DOGE_DECIMAL = 8
export const LOWER_FEE_BOUND = 100 // https://github.com/dogecoin/dogecoin/blob/master/doc/fee-recommendation.md
export const UPPER_FEE_BOUND = 20_000_000

/**
 * Chain identifier for Dogecoin
 *
 */
export const DOGEChain = 'DOGE' as const

/**
 * Base "chain" asset on dogecoin
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetDOGE: Asset = { chain: DOGEChain, symbol: 'DOGE', ticker: 'DOGE', synth: false }

// https://blockchair.com/

const DOGE_MAINNET_EXPLORER = new ExplorerProvider(
  'https://blockchair.com/dogecoin',
  'https://blockchair.com/dogecoin/address/%%ADDRESS%%',
  'https://blockchair.com/dogecoin/transaction/%%TX_ID%%',
)
const DOGE_TESTNET_EXPLORER = new ExplorerProvider(
  'https://blockexplorer.one/dogecoin/testnet',
  'https://blockexplorer.one/dogecoin/testnet/address/%%ADDRESS%%',
  'https://blockexplorer.one/dogecoin/testnet/tx/%%TX_ID%%',
)
export const blockstreamExplorerProviders = {
  [Network.Testnet]: DOGE_TESTNET_EXPLORER,
  [Network.Stagenet]: DOGE_MAINNET_EXPLORER,
  [Network.Mainnet]: DOGE_MAINNET_EXPLORER,
}

//======================
// sochain
//======================

const testnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env['SOCHAIN_API_KEY'] || '',
  DOGEChain,
  AssetDOGE,
  8,
  SochainNetwork.DOGETEST,
)
const mainnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env['SOCHAIN_API_KEY'] || '',
  DOGEChain,
  AssetDOGE,
  8,
  SochainNetwork.DOGE,
)
export const sochainDataProviders = {
  [Network.Testnet]: testnetSochainProvider,
  [Network.Stagenet]: mainnetSochainProvider,
  [Network.Mainnet]: mainnetSochainProvider,
}

//======================
// Blockcypher
//======================

const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  DOGEChain,
  AssetDOGE,
  8,
  BlockcypherNetwork.DOGE,
  process.env['BlOCKCYPHER_API_KEY'] || '',
)
export const blockcypherDataProviders = {
  [Network.Testnet]: undefined, //no provider here
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}
