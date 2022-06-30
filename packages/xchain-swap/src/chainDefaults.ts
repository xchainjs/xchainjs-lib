import { Chain } from "@xchainjs/xchain-util/lib"
import { ConfCountingSetting } from "./types"

const defaultConfCountingConfig: Record<Chain,ConfCountingSetting> = {
  BCH: {
    blockReward: 6.25,
    avgBlockTimeInSecs: 600
  },
  BTC: {
    blockReward: 6.25,
    avgBlockTimeInSecs: 600
  },
  ETH: {
    blockReward: 2,
    avgBlockTimeInSecs: 13
  },
  LTC: {
    blockReward: 12.5,
    avgBlockTimeInSecs: 150
  },
  DOGE: {
    blockReward: 10000,
    avgBlockTimeInSecs: 60
  },
  GAIA: {
    blockReward: 0,
    avgBlockTimeInSecs: 0
  },
  TERRA: {
    blockReward: 0,
    avgBlockTimeInSecs: 0
  },
  BNB: {
    blockReward: 0,
    avgBlockTimeInSecs: 0
  },
  THOR: {
    blockReward: 0,
    avgBlockTimeInSecs: 0
  },
  POLKA: {
    blockReward: 0,
    avgBlockTimeInSecs: 0
  },
}

export {defaultConfCountingConfig}
