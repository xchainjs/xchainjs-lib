/* eslint-disable ordered-imports/ordered-imports */
import { Chain } from '@xchainjs/xchain-util/lib'
import { Explorer } from './Explorer'
import { BlockstreamExplorer } from './BlockstreamExplorer'

const BLOCKSTREAM_BTC_EXPLORER = new BlockstreamExplorer(Chain.Bitcoin)

interface NamedChainExplorerMap {
  [index: string]: Explorer
}
export type ExplorersType = {
  [index in Chain]: NamedChainExplorerMap
}

const Explorers: ExplorersType = {
  BTC: {
    DEFAULT: BLOCKSTREAM_BTC_EXPLORER,
    BLOCKSTREAM: BLOCKSTREAM_BTC_EXPLORER,
  },
  BCH: {},
  LTC: {},
  ETH: {},
  BNB: {},
  THOR: {},
  GAIA: {},
  POLKA: {},
  TERRA: {},
  DOGE: {},
}

export { Explorers }
