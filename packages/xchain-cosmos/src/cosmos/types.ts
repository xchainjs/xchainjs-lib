import { BigSource } from 'big.js'

import { PrivKey, Msg } from 'cosmos-client'
import { BaseAccount, StdTx } from 'cosmos-client/x/auth'

export type CosmosSDKClientParams = {
  server: string
  chainId: string
  prefix?: string
  derive_path?: string
}

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
