import { chains } from './chain.const'
import { Chain } from './types'

/**
 * Type guard to check whether string  is based on type `Chain`
 *
 * @param {string} c The chain string.
 * @returns {boolean} `true` or `false`
 */
export const isChain = (c: string): c is Chain => chains.includes(c as Chain)

/**
 * Convert chain to string.
 *
 * @param {Chain} chainId.
 * @returns {string} The string based on the given chain type.
 */
export const chainToString = (chainId: Chain) => {
  switch (chainId) {
    case 'THOR':
      return 'Thorchain'
    case 'BTC':
      return 'Bitcoin'
    case 'ETH':
      return 'Ethereum'
    case 'BNB':
      return 'Binance Chain'
    case 'GAIA':
      return 'Cosmos'
    case 'POLKA':
      return 'Polkadot'
    default:
      return 'unknown chain'
  }
}
