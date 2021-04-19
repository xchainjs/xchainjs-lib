import { Asset, BaseAmount } from '@xchainjs/xchain-util'

export type NodeUrl = {
  node: string
  rpc: string
}

export type ClientUrl = {
  testnet: NodeUrl
  mainnet: NodeUrl
}

export type ExplorerUrl = {
  testnet: string
  mainnet: string
}

export type ThorchainClientParams = {
  clientUrl?: ClientUrl
  explorerUrl?: ExplorerUrl
}

export type DepositParam = {
  asset?: Asset
  amount: BaseAmount
  memo: string
}

export const THORChain = 'THOR'
export const AssetRune: Asset = { chain: THORChain, symbol: 'RUNE', ticker: 'RUNE' }
