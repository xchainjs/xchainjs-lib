// Import necessary types from external package
import { Asset, AssetType } from '@xchainjs/xchain-util'

/**
 * Chain identifier for BNB.
 * This constant represents the identifier for the Binance Chain.
 */
export const BNBChain = 'BNB' as const

/**
 * Base "chain" asset of Binance chain.
 * This constant represents the base asset of the Binance Chain.
 * It includes information about the chain, symbol, ticker, and whether it's synthetic or not.
 */
export const AssetBNB: Asset = { chain: BNBChain, symbol: 'BNB', ticker: 'BNB', type: AssetType.NATIVE }

/**
 * Asset Decimal.
 * This constant represents the decimal precision used for BNB.
 */
export const BNB_DECIMAL = 8
