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
  confirmedOnly: boolean
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
  hash: string
  block_hash: string
  confirmations: number
  time: number

  tx_hex: string
  inputs: TxIO[]
  outputs: TxIO[]
}

export type BtcAddressUTXO = {
  hash: string
  index: number
  script: string
  address: string
  tx_hex: string
  value: string
  // confirmations: number
  // time: number
}

export type BtcAddressTxDTO = {
  hash: string
  block: number
  time: number
}

export type BtcAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
}
export type BtcGetTxsDTO = {
  transactions: BtcAddressTxDTO[]
}

export type BtcGetBalanceDTO = {
  confirmed: string
  unconfirmed: string
}

export type BtcUnspentTxsDTO = {
  outputs: BtcAddressUTXO[]
}

export type BtcBroadcastTransfer = {
  network: string
  txid: string
}

export type TxConfirmedStatus = {
  network: string
  txid: string
  confirmations: number
  is_confirmed: boolean
}

export type ScanUTXOParam = {
  apiKey: string
  sochainUrl: string
  haskoinUrl: string
  network: Network
  address: string
  confirmedOnly?: boolean
  withTxHex?: boolean
}
