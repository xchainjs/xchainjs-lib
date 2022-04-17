import { Network, TxHash } from '../../types'

export type AddressParams = {
  address: string
  network: Network
}
export type UnspentTXsParams = {
  address: string
  network: Network
  startingFromTxId?: string
}
export type TxHashParams = {
  hash: TxHash
  network: Network
}

export type TxBroadcastParams = {
  txHex: string
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
  txid: string
  blockhash: string
  confirmations: number
  time: number

  tx_hex: string
  inputs: TxIO[]
  outputs: TxIO[]
}

export type AddressUTXO = {
  txid: string
  output_no: number
  script_asm: string
  script_hex: string
  value: string
  confirmations: number
  time: number
}

export type AddressTxDTO = {
  txid: string
  block_no: number
  confirmations: number
  time: number
  req_sigs: number
  script_asm: string
  script_hex: string
}

export type AddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
  txs: AddressTxDTO[]
}

export type GetBalanceDTO = {
  network: string
  address: string
  confirmed_balance: string
  unconfirmed_balance: string
}

export type UnspentTxsDTO = {
  network: string
  address: string
  txs: AddressUTXO[]
}

export type BroadcastTransfer = {
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
  sochainUrl: string
  haskoinUrl: string
  network: Network
  address: string
  confirmedOnly?: boolean
  withTxHex?: boolean
}
