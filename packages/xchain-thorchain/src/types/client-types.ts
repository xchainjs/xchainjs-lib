import { Asset, BaseAmount } from '@thorwallet/xchain-util'
import { Network } from '@thorwallet/xchain-client/lib'

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

export const THORChain = 'THOR'
export const AssetRune: Asset = { chain: THORChain, symbol: 'RUNE', ticker: 'RUNE' }
