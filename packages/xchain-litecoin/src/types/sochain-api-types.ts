import { Network, TxHash } from '@thorwallet/xchain-client'

export type AddressParams = {
  sochainUrl: string
  network: Network
  address: string
  startingFromTxId?: string
}

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

  inputs: TxIO[]
  outputs: TxIO[]
}

export type LtcAddressUTXO = {
  txid: string
  output_no: number
  script_asm: string
  script_hex: string
  value: string
  confirmations: number
  time: number
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

export type LtcAddressUTXOs = LtcAddressUTXO[]

export type LtcBroadcastTransfer = {
  network: string
  txid: string
}
