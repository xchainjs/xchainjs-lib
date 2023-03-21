import { ExplorerProvider, Network, UtxoOnlineDataProviders } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { HaskoinNetwork, HaskoinProvider } from '@xchainjs/xchain-utxo-providers'

export const LOWER_FEE_BOUND = 1
export const UPPER_FEE_BOUND = 500

/**
 * Chain identifier for Bitcoin Cash
 *
 */
export const BCHChain = 'BCH' as const

/**
 * Base "chain" asset on bitcoincash main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetBCH: Asset = { chain: BCHChain, symbol: 'BCH', ticker: 'BCH', synth: false }

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
//======================
// haskoin
//======================
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
