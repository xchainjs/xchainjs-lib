import { Network, TxHash } from '@xchainjs/xchain-client/lib'

export type AddressParams = {
  haskoinUrl: string
  address: string
}

export type TxHashParams = {
  haskoinUrl: string
  txId: TxHash
}

export type NodeAuth = {
  username: string
  password: string
}

export type TxBroadcastParams = {
  network: Network
  txHex: string
  nodeUrl: string
  auth?: NodeAuth
}

export type ErrorResponse = {
  error: string
}

export type AddressBalance = {
  received: number
  utxo: number
  address: string
  txs: number
  unconfirmed: number
  confirmed: number
}

export type TransactionInput = {
  pkscript: string
  value: number
  address: string | null
  witness: string[]
  sequence: number
  output: number
  sigscript: string
  coinbase: boolean
  txid: string
}

export type TransactionOutput = {
  spent: boolean
  pkscript: string
  value: number
  address: string | null
  spender: {
    input: number
    txid: string
  } | null
}

export type Transaction = {
  time: number
  size: number
  inputs: TransactionInput[]
  weight: number
  fee: number
  locktime: number
  block: {
    height: number
    position: number
  }
  outputs: TransactionOutput[]
  version: number
  deleted: boolean
  rbf: boolean
  txid: string
}

export type RawTransaction = {
  result: string
}

export type TransactionsQueryParam = {
  offset?: number
  limit?: number
}

export type TxUnspent = {
  pkscript: string
  value: number
  address: string
  block: {
    height: number
    position: number
  }
  index: number
  txid: string
}
