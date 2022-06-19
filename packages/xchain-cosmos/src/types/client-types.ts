import { Network } from '@xchainjs/xchain-client'
import { Asset, Chain } from '@xchainjs/xchain-util'

export const AssetAtom: Asset = { chain: Chain.Cosmos, symbol: 'ATOM', ticker: 'ATOM', synth: false }
export const AssetMuon: Asset = { chain: Chain.Cosmos, symbol: 'MUON', ticker: 'MUON', synth: false }

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
