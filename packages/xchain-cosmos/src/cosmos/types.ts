import { TxParams } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'
import { BigSource } from 'big.js'
import { Msg, PrivKey, codec } from 'cosmos-client'
import { StdTxFee } from 'cosmos-client/api'
import { BaseAccount, StdTx } from 'cosmos-client/x/auth'

export type CosmosSDKClientParams = {
  server: string
  chainId: string
  prefix?: string
}

export type SearchTxParams = {
  messageAction?: string
  messageSender?: string
  transferSender?: string
  transferRecipient?: string
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
  fee?: StdTxFee
}

export type TransferOfflineParams = TransferParams & {
  from_account_number: string
  from_sequence: string
}

export type TxOfflineParams = TxParams & {
  from_balance: BaseAmount
  from_account_number: string
  from_sequence: string
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

export type TxEventAttribute = {
  key: string
  value: string
}

export type TxEvent = {
  type: string
  attributes: TxEventAttribute[]
}

export type TxLog = {
  msg_index: number
  log: string
  events: TxEvent[]
}

export type TxResponse = {
  height?: number
  txhash?: string
  data: string
  raw_log?: string
  logs?: TxLog[]
  gas_wanted?: string
  gas_used?: string
  tx?: StdTx | RawTxResponse | codec.AminoWrapping
  timestamp: string
}

export type TxHistoryResponse = {
  total_count?: number
  count?: number
  page_number?: number
  page_total?: number
  limit?: number
  txs?: TxResponse[]
}

export type APIQueryParam = {
  [x: string]: string
}

export type RPCTxResult = {
  hash: string
  height: string
  index: number
  tx_result: {
    code: number
    data: string
    log: string
    info: string
    gas_wanted: string
    gas_used: string
    events: TxEvent[]
    codespace: string
  }
  tx: string
}

export type RPCTxSearchResult = {
  txs: RPCTxResult[]
  total_count: string
}

export type RPCResponse<T> = {
  jsonrpc: string
  id: number
  result: T
}
