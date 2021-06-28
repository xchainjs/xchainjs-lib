import { Network, Tx } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'

export type NodeUrl = {
  node: string
  rpc: string
}

export type ClientUrl = {
  testnet: NodeUrl
  mainnet: NodeUrl
}

export type ExplorerUrls = {
  root: ExplorerUrl
  tx: ExplorerUrl
  address: ExplorerUrl
}

export type ExplorerUrl = Record<Network, string>

export type ThorchainClientParams = {
  clientUrl?: ClientUrl
  explorerUrls?: ExplorerUrls
}

export type DepositParam = {
  walletIndex?: number
  asset?: Asset
  amount: BaseAmount
  memo: string
}

export const AssetRune: Asset = { chain: Chain.THORChain, symbol: 'RUNE', ticker: 'RUNE' }

export type TxData = Pick<Tx, 'from' | 'to' | 'type'>
