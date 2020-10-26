import { BigSource } from 'big.js'

import { Asset } from '@xchainjs/xchain-util'
import { PrivKey, Msg } from 'cosmos-client'
import { BaseAccount, StdTx } from 'cosmos-client/x/auth'

export const CosmosChain = 'THOR'
export const AssetAtom: Asset = { chain: CosmosChain, symbol: 'ATOM', ticker: 'ATOM' }
export const AssetMuon: Asset = { chain: CosmosChain, symbol: 'MUON', ticker: 'MUON' }

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

export type BaseAccountResponse = {
  type?: string
  value?: BaseAccount
}

export type RawTxResponse = {
  body: {
    messages: Msg[]
  }
}

export type TxResponse = {
  height?: number
  txhash?: string
  raw_log?: string
  gas_wanted?: string
  gas_used?: string
  tx?: StdTx | RawTxResponse
  timestamp: string
}

export type TxHistoryResponse = {
  total_count?: number
  count?: number
  page_number?: number
  page_total?: number
  limit?: number
  txs?: Array<TxResponse>
}

export type APIQueryParam = {
  [x: string]: string
}
