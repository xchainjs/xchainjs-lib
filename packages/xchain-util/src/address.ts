import { BTCChain, BNBChain, CosmosChain, ETHChain, THORChain, PolkadotChain } from './chain.const'
import { Chain } from './types'

/**
 * Get address prefix based on the chain and network.
 *
 * @param {Chain} chain
 * @param {boolean} isTestnet
 * @returns {string} The address prefix based on the chain and network.
 *
 **/
export const getPrefix = (chain: Chain, isTestnet: boolean): string => {
  switch (chain) {
    case THORChain:
      return isTestnet ? 'tthor' : 'thor'
    case BTCChain:
      return isTestnet ? 'tb1' : 'bc1'
    case BNBChain:
      return isTestnet ? 'tbnb' : 'bnb'
    case CosmosChain:
      return 'cosmos'
    case ETHChain:
      return '0x'
    case PolkadotChain:
      return isTestnet ? '5' : '1'
  }
}
