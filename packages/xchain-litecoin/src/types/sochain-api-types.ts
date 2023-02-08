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

export type ScanUTXOParam = {
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

export interface SochainResponse<T> {
  data: T
  status: string
}

export interface TxIO {
  input_no: number
  value: string
  address: string
  type: string
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

export type LtcAddressUTXO = {
  hash: string
  index: number
  script: string
  address: string
  tx_hex: string
  value: string
  //confirmations: number
  // time: number
}

export type LtcAddressTxDTO = {
  hash: string
  block: number
  time: number
}

export type LtcAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
}
export type LtcGetTxsDTO = {
  transactions: LtcAddressTxDTO[]
}

export type LtcGetBalanceDTO = {
  confirmed: string
  unconfirmed: string
}

export type LtcUnspentTxsDTO = {
  outputs: LtcAddressUTXO[]
}

export type LtcBroadcastTransfer = {
  network: string
  txid: string
}
