import { Network, TxHash } from '@xchainjs/xchain-client'

export type TxHashParams = {
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

export type DogeAddressUTXO = {
  txid: string
  output_no: number
  script_asm: string
  script_hex: string
  value: string
  confirmations: number
  time: number
}

export type DogeAddressTxDTO = {
  txid: string
  block_no: number
  confirmations: number
  time: number
  req_sigs: number
  script_asm: string
  script_hex: string
}

export type DogeAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
  txs: DogeAddressTxDTO[]
}

export type DogeGetBalanceDTO = {
  network: string
  address: string
  confirmed_balance: string
  unconfirmed_balance: string
}

export type DogeUnspentTxsDTO = {
  network: string
  address: string
  txs: DogeAddressUTXO[]
}

export type DogeBroadcastTransfer = {
  network: string
  txid: string
}
