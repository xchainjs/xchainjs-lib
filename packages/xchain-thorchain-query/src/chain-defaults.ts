import { Chain } from '@xchainjs/xchain-util'

import { ChainAttributes } from './types'

const DefaultChainAttributes: Record<Chain, ChainAttributes> = {
  BCH: {
    blockReward: 6.25,
    avgBlockTimeInSecs: 600,
  },
  BTC: {
    blockReward: 6.25,
    avgBlockTimeInSecs: 600,
  },
  ETH: {
    blockReward: 2,
    avgBlockTimeInSecs: 13,
  },
  AVAX: {
    blockReward: 2,
    avgBlockTimeInSecs: 3,
  },
  LTC: {
    blockReward: 12.5,
    avgBlockTimeInSecs: 150,
  },
  DOGE: {
    blockReward: 10000,
    avgBlockTimeInSecs: 60,
  },
  GAIA: {
    blockReward: 0,
    avgBlockTimeInSecs: 6,
  },
  THOR: {
    blockReward: 0,
    avgBlockTimeInSecs: 6,
  },
  BSC: {
    blockReward: 0,
    avgBlockTimeInSecs: 3,
  },
  BASE: {
    blockReward: 0,
    avgBlockTimeInSecs: 2,
  },
  XRP: {
    blockReward: 0,
    avgBlockTimeInSecs: 4,
  },
  SOL: {
    blockReward: 0,
    avgBlockTimeInSecs: 0.4,
  },
  TRON: {
    blockReward: 0,
    avgBlockTimeInSecs: 3,
  },
  ZEC: {
    blockReward: 1.5625, // Block reward for Zcash (post-Canopy halving)
    avgBlockTimeInSecs: 75,
  },
}

export { DefaultChainAttributes }
