import { TxHash } from '@xchainjs/xchain-client'

export enum SochainNetwork {
  BTC = 'BTC',
  BTCTEST = 'BTCTEST',
  LTC = 'LTC',
  LTCTEST = 'LTCTEST',
  DOGE = 'DOGE',
  DOGETEST = 'DOGETEST',
}

export type AddressParams = {
  apiKey: string
  sochainUrl: string
  network: SochainNetwork
  address: string
  page: number
}
export type BalanceParams = {
  apiKey: string
  sochainUrl: string
  network: SochainNetwork
  address: string
  confirmedOnly: boolean
  assetDecimals: number
}

export type TxHashParams = {
  apiKey: string
  sochainUrl: string
  network: SochainNetwork
  hash: TxHash
}

export type TxBroadcastParams = {
  apiKey: string
  sochainUrl: string
  network: SochainNetwork
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
  hash: string
  block: number
  time: number
}

export type AddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
}
export type GetTxsDTO = {
  transactions: AddressTxDTO[]
}

export type GetBalanceDTO = {
  confirmed: string
  unconfirmed: string
}
export type BroadcastDTO = {
  hash: string
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
