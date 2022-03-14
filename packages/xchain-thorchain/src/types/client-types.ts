import { Network, Tx } from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

export type NodeUrl = {
  node: string
  rpc: string
}

export type ClientUrl = Record<Network, NodeUrl>

export type ExplorerUrls = {
  root: ExplorerUrl
  tx: ExplorerUrl
  address: ExplorerUrl
}

export type ExplorerUrl = Record<Network, string>

export type ThorchainClientParams = {
  clientUrl?: ClientUrl
  explorerUrls?: ExplorerUrls
  chainId?: string
}

export type DepositParam = {
  walletIndex?: number
  asset?: Asset
  amount: BaseAmount
  memo: string
}

export type TxData = Pick<Tx, 'from' | 'to' | 'type'>
