import { chains } from './chain.const'
import { Chain } from './types'

/**
 * Type guard to check whether string  is based on type `Chain`
 */
export const isChain = (c: string): c is Chain => chains.includes(c as Chain)

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
    default:
      return 'unknown chain'
  }
}
