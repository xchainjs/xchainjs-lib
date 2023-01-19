import { Asset } from '@xchainjs/xchain-util/lib'

/**
 * Minimum transaction fee
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
export const MIN_TX_FEE = 1000
export const LOWER_FEE_BOUND = 1
export const UPPER_FEE_BOUND = 500
export const LTC_DECIMAL = 8

/**
 * Chain identifier for litecoin
 *
 */
export const LTCChain = 'LTC' as const

/**
 * Base "chain" asset on litecoin main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetLTC: Asset = { chain: LTCChain, symbol: 'LTC', ticker: 'LTC', synth: false }
