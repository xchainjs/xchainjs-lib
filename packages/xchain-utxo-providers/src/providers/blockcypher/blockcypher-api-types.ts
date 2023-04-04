import { TxHash } from '@xchainjs/xchain-client'

export enum BlockcypherNetwork {
  BTC = 'btc/main',
  BTCTEST = 'btc/test3',
  LTC = 'ltc/main',
  DOGE = 'doge/main',
}

export type AddressParams = {
  apiKey?: string
  baseUrl: string
  network: BlockcypherNetwork
  address: string
  page: number
}
export type BalanceParams = {
  apiKey?: string
  baseUrl: string
  network: BlockcypherNetwork
  address: string
  confirmedOnly: boolean
  assetDecimals: number
}

export type TxHashParams = {
  apiKey?: string
  baseUrl: string
  network: BlockcypherNetwork
  hash: TxHash
}

export type TxBroadcastParams = {
  apiKey?: string
  baseUrl: string
  network: BlockcypherNetwork
  txHex: string
}

export interface TxInput {
  output_value: string
  addresses: string[]
  script_type?: string
  // script: string
}
export interface TxOutput {
  value: string
  addresses: string[]
  script_type?: string
  script: string
}
export interface Transaction {
  hash: string
  block_hash: string
  confirmed: string

  hex: string
  inputs: TxInput[]
  outputs: TxOutput[]
}

export type AddressUTXO = {
  hash: string
  index: number
  script: string
  address: string
  tx_hex: string
  value: string
  block: number
}

export type AddressTxDTO = {
  tx_hash: string
  block_height: number
  confirmed: string
}

export type GetBalanceDTO = {
  balance: string
  unconfirmed_balance: string
  final_balance: string
  n_tx: number
  unconfirmed_n_tx: number
  final_n_tx: number
}

export type GetTxsDTO = {
  txrefs: AddressTxDTO[]
}

export type BroadcastDTO = {
  tx: {
    hash: string
  }
}
export type UnspentTxsDTO = {
  outputs: AddressUTXO[]
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
