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
  txid: string
  blockhash: string
  confirmations: number
  time: number

  tx_hex: string
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
  txid: string
  block_no: number
  confirmations: number
  time: number
  req_sigs: number
  script_asm: string
  script_hex: string
}

export type LtcAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
  txs: LtcAddressTxDTO[]
}

export type LtcGetBalanceDTO = {
  network: string
  address: string
  confirmed_balance: string
  unconfirmed_balance: string
}

export type LtcUnspentTxsDTO = {
  network: string
  address: string
  txs: LtcAddressUTXO[]
}

export type LtcBroadcastTransfer = {
  network: string
  txid: string
}
