export enum Chain {
  Avalanche = 'AVAX',
  Binance = 'BNB',
  Bitcoin = 'BTC',
  Ethereum = 'ETH',
  THORChain = 'THOR',
  Cosmos = 'GAIA',
  BitcoinCash = 'BCH',
  Litecoin = 'LTC',
  Terra = 'TERRA',
  Doge = 'DOGE',
  Avax = 'AVAX',
}
export const AvalancheChain = Chain.Avalanche
export const BNBChain = Chain.Binance
export const BTCChain = Chain.Bitcoin
export const ETHChain = Chain.Ethereum
export const THORChain = Chain.THORChain
export const CosmosChain = Chain.Cosmos
export const BCHChain = Chain.BitcoinCash
export const LTCChain = Chain.Litecoin
export const TerraChain = Chain.Terra
export const DOGEChain = Chain.Doge
export const AVAXChain = Chain.Avax

/**
 * Type guard to check whether string  is based on type `Chain`
 *
 * @param {string} c The chain string.
 * @returns {boolean} `true` or `false`
 */
export const isChain = (c: string): c is Chain => (Object.values(Chain) as string[]).includes(c)

export const isEnabledChain = (chain: Chain) => chain.includes(chain)

/**
 * Sees if one chain is equal to another chain
 *
 * @param a chain a
 * @param b chain b
 * @returns boolean: True if equal else False
 */
export const eqChain = (a: Chain, b: Chain) => {
  return a == b
}

/**
 * Convert chain to string.
 *
 * @param {Chain} chainId.
 * @returns {string} The string based on the given chain type.
 */
export const chainToString: ((chainId: Chain) => string) & Record<Chain, string> = Object.assign(
  (chainId: Chain) => {
    if (!(chainId in chainToString)) return 'unknown chain'
    return chainToString[chainId]
  },
  {
    [Chain.Avalanche]: 'Avalanche',
    [Chain.THORChain]: 'Thorchain',
    [Chain.Bitcoin]: 'Bitcoin',
    [Chain.BitcoinCash]: 'Bitcoin Cash',
    [Chain.Litecoin]: 'Litecoin',
    [Chain.Ethereum]: 'Ethereum',
    [Chain.Binance]: 'Binance Chain',
    [Chain.Cosmos]: 'Cosmos',
    [Chain.Terra]: 'Terra',
    [Chain.Doge]: 'Dogecoin',
    [Chain.Avax]: 'Avalanche',
  },
)

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain(chain, BTCChain)

/**
 * Check whether chain is LTC chain
 */
export const isLtcChain = (chain: Chain): boolean => eqChain(chain, LTCChain)

/**
 * Check whether chain is THOR chain
 */
export const isThorChain = (chain: Chain): boolean => eqChain(chain, THORChain)

/**
 * Check whether chain is BNB chain
 */
export const isBnbChain = (chain: Chain): boolean => eqChain(chain, BNBChain)

/**
 * Check whether chain is ETH chain
 */
export const isEthChain = (chain: Chain): boolean => eqChain(chain, ETHChain)

/**
 * Check whether chain is BCH chain
 */
export const isBchChain = (chain: Chain): boolean => eqChain(chain, BCHChain)

/**
 * Check whether chain is DOGE chain
 */
export const isDogeChain = (chain: Chain): boolean => eqChain(chain, DOGEChain)

/**
 * Check whether chain is TERRA chain
 */
export const isTerraChain = (chain: Chain): boolean => eqChain(chain, TerraChain)
