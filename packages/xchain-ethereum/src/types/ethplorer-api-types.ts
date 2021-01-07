export interface TokenInfo {
  address: string
  decimals: string
  name: string
  owner: string
  symbol: string
  totalSupply: string
  lastUpdated: number
  issuancesCount: number
  holdersCount: number
  ethTransfersCount: number
  price: boolean
}

export interface TokenBalance {
  tokenInfo: TokenInfo
  balance: number
  totalIn?: number
  totalOut?: number
}

export interface AddressInfo {
  address: string
  ETH: {
    balance: number
    totalIn?: number
    totalOut?: number
    price: {
      rate: number
      diff: number
      diff7d: number
      ts: number
      marketCapUsd: number
      availableSupply: number
      volume24h: number
      diff30d: number
      volDiff1: number
      volDiff7: number
      volDiff30: number
    }
  }
  contractInfo?: {
    creatorAddress: string
    transactionHash: string
    timestamp: string
  }
  tokenInfo?: TokenInfo
  tokens: TokenBalance[]
  countTxs: number
}
