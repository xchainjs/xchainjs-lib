import cosmosclient from '@cosmos-client/core'
import { TxParams } from '@xchainjs/xchain-client'
import { Address, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

export type CosmosSDKClientParams = {
  server: string
  chainId: string
  prefix?: string
  headers?: Record<string, string>
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

export type UnsignedTxParams = {
  from: string
  to: string
  amount: BaseAmount
  denom: string
  memo?: string
}

export type TransferParams = {
  privkey: cosmosclient.proto.cosmos.crypto.secp256k1.PrivKey
  from: Address
  to: Address
  amount: BaseAmount
  denom: string
  memo?: string
  fee?: cosmosclient.proto.cosmos.tx.v1beta1.Fee
}

export type TransferOfflineParams = TransferParams & {
  from_account_number: string
  from_sequence: string
}

export type TxOfflineParams = TxParams & {
  from_account_number: string
  from_sequence: string
  gasLimit?: BigNumber
  feeAmount?: BaseAmount
}

export type RawTxResponse = {
  body: {
    messages: cosmosclient.proto.cosmos.bank.v1beta1.IMsgSend[]
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

export type GetTxByHashResponse = {
  tx_response: TxResponse
}

export type TxResponse = {
  height?: number
  txhash?: string
  data: string
  raw_log?: string
  logs?: TxLog[]
  gas_wanted?: string
  gas_used?: string
  tx?: RawTxResponse
  timestamp: string
}

export type TxHistoryResponse = {
  page_number?: number
  page_total?: number
  limit?: number
  pagination?: {
    total: string
  }
  tx_responses?: TxResponse[]
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
