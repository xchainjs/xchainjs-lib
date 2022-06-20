import { Network } from '@xchainjs/xchain-client'

export type ClientUrls = Record<Network, string>

export type ExplorerUrl = Record<Network, string>

export type ExplorerUrls = {
  root: ExplorerUrl
  tx: ExplorerUrl
  address: ExplorerUrl
}

export type ChainId = string
export type ChainIds = Record<Network, ChainId>

export type CosmosClientParams = {
  clientUrls?: ClientUrls
  chainIds?: ChainIds
}
