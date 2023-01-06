import { Asset, Chain } from '@xchainjs/xchain-util'

/**
 * Chain identifier for BNB.
 *
 */
export const BNBChain: Chain = 'BNB'

/**
 * Base "chain" asset of Binance chain.
 *
 */
export const AssetBNB: Asset = { chain: BNBChain, symbol: 'BNB', ticker: 'BNB', synth: false }
