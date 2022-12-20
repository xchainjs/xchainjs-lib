import { Chain } from './types'

export const AVAXChain = 'AVAX'
export const BCHChain = 'BCH'
export const BNBChain = 'BNB'
export const BTCChain = 'BTC'
export const CosmosChain = 'GAIA'
export const DOGEChain = 'DOGE'
export const ETHChain = 'ETH'
export const LTCChain = 'LTC'
export const THORChain = 'THOR'

const chains: Chain[] = [BNBChain, BTCChain, ETHChain, THORChain, CosmosChain, BCHChain, LTCChain, DOGEChain, AVAXChain]

const chainNames: Record<Chain, string> = {
  [AVAXChain]: 'Avalanche',
  [BCHChain]: 'Bitcoin Cash',
  [BNBChain]: 'Binance Chain',
  [BTCChain]: 'Bitcoin',
  [CosmosChain]: 'Cosmos',
  [DOGEChain]: 'Dogecoin',
  [ETHChain]: 'Ethereum',
  [LTCChain]: 'Litecoin',
  [THORChain]: 'Thorchain',
}

/**
 * Check if a given chain is supported by xchain-util
 *
 * @param {string} c The chain string.
 * @returns {boolean} `true` or `false`
 */
export const isChain = (c: Chain): boolean => chains.includes(c)

/**
 * Sees if one chain is equal to another chain
 *
 * @param a chain a
 * @param b chain b
 * @returns boolean: True if equal else False
 */
export const eqChain = (a: Chain, b: Chain) => a == b

/**
 * Convert chain to string.
 *
 * @param {Chain} chainId.
 * @returns {string} The string based on the given chain type.
 */
export const chainToString = (chainId: Chain): string | undefined => chainNames[chainId]

/**
 * Check whether chain is AVAX chain
 */
export const isAVAXChain = (chain: Chain): boolean => eqChain(chain, AVAXChain)

/**
 * Check whether chain is BCH chain
 */
export const isBchChain = (chain: Chain): boolean => eqChain(chain, BCHChain)

/**
 * Check whether chain is BNB chain
 */
export const isBnbChain = (chain: Chain): boolean => eqChain(chain, BNBChain)

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain(chain, BTCChain)

/**
 * Check whether chain is Cosmos chain
 */
export const isCosmosChain = (chain: Chain): boolean => eqChain(chain, CosmosChain)

/**
 * Check whether chain is DOGE chain
 */
export const isDogeChain = (chain: Chain): boolean => eqChain(chain, DOGEChain)

/**
 * Check whether chain is ETH chain
 */
export const isEthChain = (chain: Chain): boolean => eqChain(chain, ETHChain)

/**
 * Check whether chain is LTC chain
 */
export const isLtcChain = (chain: Chain): boolean => eqChain(chain, LTCChain)

/**
 * Check whether chain is THOR chain
 */
export const isTHORChain = (chain: Chain): boolean => eqChain(chain, THORChain)
