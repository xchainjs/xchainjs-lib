import { Asset } from '@xchainjs/xchain-util'

/**
 * Minimum transaction fee
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
export const MIN_TX_FEE = 1000

export const BTC_DECIMAL = 8

export const LOWER_FEE_BOUND = 1
export const UPPER_FEE_BOUND = 500
export const BTC_SYMBOL = '₿'
export const BTC_SATOSHI_SYMBOL = '⚡'

/**
 * Chain identifier for Bitcoin mainnet
 *
 */
export const BTCChain = 'BTC' as const

/**
 * Base "chain" asset on bitcoin main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetBTC: Asset = { chain: BTCChain, symbol: 'BTC', ticker: 'BTC', synth: false }
