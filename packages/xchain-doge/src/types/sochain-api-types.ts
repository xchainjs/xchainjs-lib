import { Network, TxHash } from '@xchainjs/xchain-client'

export type AddressParams = {
  apiKey: string
  sochainUrl: string
  network: Network
  address: string
  page: number
}
export type BalanceParams = {
  apiKey: string
  sochainUrl: string
  network: Network
  address: string
}

export type TxHashParams = {
  apiKey: string
  sochainUrl: string
  network: Network
  hash: TxHash
}

export type TxBroadcastParams = {
  apiKey: string
  sochainUrl: string
  network: Network
  txHex: string
}

export interface SochainResponse<T> {
  data: T
  status: string
}

export interface TxIO {
  index: number
  value: string
  address: string
  type?: string
  script: string
}

export interface Transaction {
  network: string
  hash: string
  block_hash: string
  confirmations: number
  time: number

  inputs: TxIO[]
  outputs: TxIO[]
}

export type DogeAddressUTXO = {
  hash: string
  index: number
  script: string
  address: string
  tx_hex: string
  value: string
  // confirmations: number
  // time: number
}

export type DogeAddressTxDTO = {
  hash: string
  block: number
  time: number
}

export type DogeAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
}
export type DogeGetTxsDTO = {
  transactions: DogeAddressTxDTO[]
}

export type DogeGetBalanceDTO = {
  confirmed: string
  unconfirmed: string
}

export type DogeUnspentTxsDTO = {
  outputs: DogeAddressUTXO[]
}

export type DogeBroadcastTransfer = {
  network: string
  txid: string
}
