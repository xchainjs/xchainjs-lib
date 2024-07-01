import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  HaskoinNetwork,
  HaskoinProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'

/**
 * Lower bound for transaction fee rate.
 */
export const LOWER_FEE_BOUND = 1

/**
 * Upper bound for transaction fee rate.
 */
export const UPPER_FEE_BOUND = 500

/**
 * Decimal places for Bitcoin Cash.
 */
export const BCH_DECIMAL = 8

/**
 * Chain identifier for Bitcoin Cash.
 */
export const BCHChain = 'BCH' as const

/**
 * Base "chain" asset on Bitcoin Cash mainnet.
 * Defined according to Thorchain's asset structure.
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetBCH: Asset = { chain: BCHChain, symbol: 'BCH', ticker: 'BCH', type: AssetType.NATIVE }

/**
 * Explorer provider URLs for Bitcoin Cash.
 */
const BCH_MAINNET_EXPLORER = new ExplorerProvider(
  'https://www.blockchain.com/bch/',
  'https://www.blockchain.com/bch/address/%%ADDRESS%%',
  'https://www.blockchain.com/bch/tx/%%TX_ID%%',
)
const BCH_TESTNET_EXPLORER = new ExplorerProvider(
  'https://www.blockchain.com/bch-testnet/',
  'https://www.blockchain.com/bch-testnet/address/%%ADDRESS%%',
  'https://www.blockchain.com/bch-testnet/tx/%%TX_ID%%',
)
export const explorerProviders = {
  [Network.Testnet]: BCH_TESTNET_EXPLORER,
  [Network.Stagenet]: BCH_MAINNET_EXPLORER,
  [Network.Mainnet]: BCH_MAINNET_EXPLORER,
}

/**
 * Haskoin data providers for Bitcoin Cash.
 */
const testnetHaskoinProvider = new HaskoinProvider(
  'https://api.haskoin.com',
  BCHChain,
  AssetBCH,
  8,
  HaskoinNetwork.BCHTEST,
)
const mainnetHaskoinProvider = new HaskoinProvider(
  'https://haskoin.ninerealms.com',
  BCHChain,
  AssetBCH,
  8,
  HaskoinNetwork.BCH,
)
export const HaskoinDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetHaskoinProvider,
  [Network.Stagenet]: mainnetHaskoinProvider,
  [Network.Mainnet]: mainnetHaskoinProvider,
}

/**
 * Bitgo data providers for Bitcoin Cash.
 */
const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: BCHChain,
})
export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
