import { BigSource } from 'big.js'

import { Asset } from '@xchainjs/xchain-util'
import { PrivKey } from 'cosmos-client'

export type SearchTxParams = {
  messageAction?: string
  messageSender?: string
  page?: number
  limit?: number
  txMinHeight?: number
  txMaxHeight?: number
}

export type TransferParams = {
  privkey: PrivKey
  from: string
  to: string
  amount: BigSource
  asset: string
  memo?: string
}

// This needs to be updated asgardex-util does not support COSMOS
export const CosmosChain = 'THOR'
export const AssetAtom: Asset = { chain: CosmosChain, symbol: 'ATOM', ticker: 'ATOM' }
export const AssetMuon: Asset = { chain: CosmosChain, symbol: 'MUON', ticker: 'MUON' }
