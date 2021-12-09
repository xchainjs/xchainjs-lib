import { Network, TxHash } from '@xchainjs/xchain-client'

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

export type ZecAddressUTXO = {
  txid: string
  output_no: number
  script_asm: string
  script_hex: string
  value: string
  confirmations: number
  time: number
}

export type ZecAddressTxDTO = {
  txid: string
  block_no: number
  confirmations: number
  time: number
  req_sigs: number
  script_asm: string
  script_hex: string
}

export type ZecAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
  txs: ZecAddressTxDTO[]
}

export type ZecGetBalanceDTO = {
  network: string
  address: string
  confirmed_balance: string
  unconfirmed_balance: string
}

export type ZecUnspentTxsDTO = {
  network: string
  address: string
  txs: ZecAddressUTXO[]
}

export type ZecBroadcastTransfer = {
  network: string
  txid: string
}
