import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  BlockbookProvider,
  HaskoinNetwork,
  HaskoinProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'

import * as bchaddr from './bchaddrjs'

export const LOWER_FEE_BOUND = 1

export const UPPER_FEE_BOUND = 500

export const BCH_DECIMAL = 8

export const BCHChain = 'BCH' as const

/** Thorchain asset shape. @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24 */
export const AssetBCH: Asset = { chain: BCHChain, symbol: 'BCH', ticker: 'BCH', type: AssetType.NATIVE }

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

const testnetHaskoinProvider = new HaskoinProvider(
  'https://api.haskoin.com',
  BCHChain,
  AssetBCH,
  8,
  HaskoinNetwork.BCHTEST,
)
const mainnetHaskoinProvider = new HaskoinProvider('https://api.haskoin.com', BCHChain, AssetBCH, 8, HaskoinNetwork.BCH)
export const HaskoinDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetHaskoinProvider,
  [Network.Stagenet]: mainnetHaskoinProvider,
  [Network.Mainnet]: mainnetHaskoinProvider,
}

// nativeswap.io operated Blockbook instance — no SLA or API key auth - 500 requests per hour
// Changeable to any blockbook api. For example: Nownodes
const mainnetBchBlockbookProvider = new BlockbookProvider('https://bch.nativeswap.io/api/v2', AssetBCH, BCH_DECIMAL, {
  normalizeAddressForApi: bchaddr.toCashAddress,
})
export const BlockbookDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined, // NowNodes does not provide a BCH testnet Blockbook node
  [Network.Stagenet]: mainnetBchBlockbookProvider,
  [Network.Mainnet]: mainnetBchBlockbookProvider,
}

const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: BCHChain,
})
export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
