import { Asset } from '@xchainjs/xchain-util'

/**
 * Chain identifier for BNB.
 *
 */
export const BNBChain = 'BNB' as const

/**
 * Base "chain" asset of Binance chain.
 *
 */
export const AssetBNB: Asset = { chain: BNBChain, symbol: 'BNB', ticker: 'BNB', synth: false }

/**
 * Asset Decimal
 */
export const BNB_DECIMAL = 8
