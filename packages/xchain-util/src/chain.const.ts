/**
 * Chains
 *
 * Based on definition in Thorchain `common`
 * https://gitlab.com/thorchain/thornode/-/blob/master/common/chain.go#L15-18
 */
export const BNBChain = 'BNB'
export const BTCChain = 'BTC'
export const ETHChain = 'ETH'
export const THORChain = 'THOR'

/**
 * All possible chains Thornode currently supports (or plan to support in near future)
 * */
export const chains = [BNBChain, BTCChain, ETHChain, THORChain] as const
