// Import necessary modules and types
import { Chain } from '@xchainjs/xchain-util'

// Import the custom type ChainAttributes
import { ChainAttributes } from './types'

// Default attributes for each chain
const DefaultChainAttributes: Record<Chain, ChainAttributes> = {
  BCH: {
    blockReward: 6.25, // Block reward for Bitcoin Cash
    avgBlockTimeInSecs: 600, // Average block time for Bitcoin Cash in seconds
  },
  BTC: {
    blockReward: 6.25, // Block reward for Bitcoin
    avgBlockTimeInSecs: 600, // Average block time for Bitcoin in seconds
  },
  ETH: {
    blockReward: 2, // Block reward for Ethereum
    avgBlockTimeInSecs: 13, // Average block time for Ethereum in seconds
  },
  AVAX: {
    blockReward: 2, // Block reward for Avalanche
    avgBlockTimeInSecs: 3, // Average block time for Avalanche in seconds
  },
  LTC: {
    blockReward: 12.5, // Block reward for Litecoin
    avgBlockTimeInSecs: 150, // Average block time for Litecoin in seconds
  },
  DOGE: {
    blockReward: 10000, // Block reward for Dogecoin
    avgBlockTimeInSecs: 60, // Average block time for Dogecoin in seconds
  },
  GAIA: {
    blockReward: 0, // No block reward for Gaia
    avgBlockTimeInSecs: 6, // Average block time for Gaia in seconds
  },
  THOR: {
    blockReward: 0, // No block reward for THORChain
    avgBlockTimeInSecs: 6, // Average block time for THORChain in seconds
  },
  BSC: {
    blockReward: 0, // No block reward for Binance Smart Chain
    avgBlockTimeInSecs: 3, // Average block time for Binance Smart Chain in seconds
  },
  MAYA: {
    blockReward: 0, // No block reward for MAYAChain
    avgBlockTimeInSecs: 6, // Average block time for MAYAChain in seconds
  },
  BASE: {
    blockReward: 0, // No block reward for base
    avgBlockTimeInSecs: 2, // Average block time for Base in seconds
  },
}

// Export the DefaultChainAttributes object
export { DefaultChainAttributes }
