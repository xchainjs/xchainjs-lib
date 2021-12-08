export enum Chain {
  Binance = 'BNB',
  Bitcoin = 'BTC',
  Ethereum = 'ETH',
  THORChain = 'THOR',
  Cosmos = 'GAIA',
  Polkadot = 'POLKA',
  BitcoinCash = 'BCH',
  Litecoin = 'LTC',
  Zcash = 'ZEC',
}

export const BNBChain = Chain.Binance
export const BTCChain = Chain.Bitcoin
export const ETHChain = Chain.Ethereum
export const THORChain = Chain.THORChain
export const CosmosChain = Chain.Cosmos
export const PolkadotChain = Chain.Polkadot
export const BCHChain = Chain.BitcoinCash
export const LTCChain = Chain.Litecoin
export const ZcashChain = Chain.Zcash

/**
 * Type guard to check whether string  is based on type `Chain`
 *
 * @param {string} c The chain string.
 * @returns {boolean} `true` or `false`
 */
export const isChain = (c: string): c is Chain => (Object.values(Chain) as string[]).includes(c)

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
    [Chain.THORChain]: 'Thorchain',
    [Chain.Bitcoin]: 'Bitcoin',
    [Chain.BitcoinCash]: 'Bitcoin Cash',
    [Chain.Litecoin]: 'Litecoin',
    [Chain.Ethereum]: 'Ethereum',
    [Chain.Binance]: 'Binance Chain',
    [Chain.Cosmos]: 'Cosmos',
    [Chain.Polkadot]: 'Polkadot',
    [Chain.Zcash]: 'Zcash',
  },
)
