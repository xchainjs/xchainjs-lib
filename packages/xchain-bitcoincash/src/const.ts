import { Asset } from '@xchainjs/xchain-util'

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
