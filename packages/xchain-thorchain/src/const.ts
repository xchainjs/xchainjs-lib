import { Network } from '@xchainjs/xchain-client/lib'
import { Asset } from '@xchainjs/xchain-util/lib'

import { ExplorerUrls } from './types'

const DEFAULT_EXPLORER_URL = 'https://viewblock.io/thorchain'
const txUrl = `${DEFAULT_EXPLORER_URL}/tx`
const addressUrl = `${DEFAULT_EXPLORER_URL}/address`
const RUNE_TICKER = 'RUNE'

export const RUNE_DECIMAL = 8
export const DEFAULT_GAS_ADJUSTMENT = 2
export const DEFAULT_GAS_LIMIT_VALUE = '4000000'
export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'
export const MAX_TX_COUNT_PER_PAGE = 100
export const MAX_TX_COUNT_PER_FUNCTION_CALL = 500
export const MAX_PAGES_PER_FUNCTION_CALL = 15
export const RUNE_SYMBOL = 'ᚱ'
export const defaultExplorerUrls: ExplorerUrls = {
  root: {
    [Network.Testnet]: `${DEFAULT_EXPLORER_URL}?network=testnet`,
    [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}?network=stagenet`,
    [Network.Mainnet]: DEFAULT_EXPLORER_URL,
  },
  tx: {
    [Network.Testnet]: txUrl,
    [Network.Stagenet]: txUrl,
    [Network.Mainnet]: txUrl,
  },
  address: {
    [Network.Testnet]: addressUrl,
    [Network.Stagenet]: addressUrl,
    [Network.Mainnet]: addressUrl,
  },
}

/**
 * Chain identifier for Thorchain
 *
 */
export const THORChain = 'THOR' as const

/**
 * Base "chain" asset for RUNE-67C on Binance test net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRune67C: Asset = { chain: 'BNB', symbol: 'RUNE-67C', ticker: RUNE_TICKER, synth: false }

/**
 * Base "chain" asset for RUNE-B1A on Binance main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneB1A: Asset = { chain: 'BNB', symbol: 'RUNE-B1A', ticker: RUNE_TICKER, synth: false }

/**
 * Base "chain" asset on thorchain main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneNative: Asset = { chain: THORChain, symbol: RUNE_TICKER, ticker: RUNE_TICKER, synth: false }

/**
 * Base "chain" asset for RUNE on ethereum main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneERC20: Asset = {
  chain: 'ETH',
  symbol: `${RUNE_TICKER}-0x3155ba85d5f96b2d030a4966af206230e46849cb`,
  ticker: RUNE_TICKER,
  synth: false,
}

/**
 * Base "chain" asset for RUNE on ethereum main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneERC20Testnet: Asset = {
  chain: 'ETH',
  symbol: `${RUNE_TICKER}-0xd601c6A3a36721320573885A8d8420746dA3d7A0`,
  ticker: RUNE_TICKER,
  synth: false,
}

/**
 * Fall back node's and rpc's
 */
export const FallBackUrls = [
  {
    [Network.Testnet]: {
      node: ['deprecated'],
      rpc: ['deprecated'],
    },
    [Network.Stagenet]: {
      node: ['https://stagenet-thornode.ninerealms.com'],
      rpc: ['https://stagenet-rpc.ninerealms.com'],
    },
    [Network.Mainnet]: {
      node: ['https://thornode-v1.ninerealms.com', 'https://thornode.thorswap.net/'],
      rpc: ['https://rpc-v1.ninerealms.com', 'https://rpc.thorswap.net'],
    },
  },
]
