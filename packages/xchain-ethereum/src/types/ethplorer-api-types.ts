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
  image?: string
  description?: string
  website?: string
  ethTransfersCount: number
  price:
    | boolean
    | {
        rate: number
        diff: number
        ts: number
        onlyPrice: number
        currency: string
      }
  publicTags?: string[]
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

export interface TransactionEventLog {
  address: string
  topics: string[]
  data: string
}

export interface TransactionOperations {
  timestamp: number
  transactionHash: string
  value: string
  intValue: number
  type: string
  priority: number
  from: string
  to: string
  addresses: string[]
  isEth: boolean
  usdPrice?: number
  tokenInfo: TokenInfo
}

export interface TransactionInfo {
  hash: string
  timestamp: number
  blockNumber: number
  confirmations: number
  success: boolean
  from: string
  to: string
  value: number
  input: string
  gasLimit: number
  gasUsed: number
  creates?: string
  logs: TransactionEventLog[]
  operations?: TransactionOperations[]
}
