import { TxHash } from '@xchainjs/xchain-client'

export type BalanceParams = {
  apiKey: string
  baseUrl: string
  address: string
  confirmedOnly: boolean
  assetDecimals: number
}

export type TxHashParams = {
  apiKey: string
  baseUrl: string
  hash: TxHash
}

export interface TxInput {
  txid: string
  vout?: number
  n: number
  sequence: number
  addresses: string[]
  isAddress: boolean
  value: string // zatoshis
  hex: string
}
export interface TxOutput {
  value: string
  n: number
  spent?: boolean
  hex: string
  addresses: string[]
  isAddress: boolean
}
export interface Transaction {
  txid: string
  version: number
  vin: TxInput[]
  vout: TxOutput[]
  blockHash: string
  blockHeight: number
  confirmations: number
  blockTime: number
  size: number
  value: string 
  valueIn: string
  fees: string
  hex: string
}

export type AddressUTXO = {
  txid: string
  vout: number
  value: string
  height: number
  confirmations: number
}

export type GetAddressInfo= {
  page: number
  totalPages: number
  itemsOnPage: number
  address: string
  balance: string
  totalReceived: string
  totalSent: string
  unconfirmedBalance: string
  unconfirmedTxs: number
  txs: number
  txids?: string[]
  transactions?: Transaction[]
}

export type BroadcastDTO = {
  result: string
}

