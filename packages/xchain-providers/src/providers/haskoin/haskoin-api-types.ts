/**
 * Haskoin API types
 */

import { TxHash } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

export enum HaskoinNetwork {
  BTC = 'btc',
  BCH = 'bch',
}

export type AddressParams = {
  apiKey: string
  haskoinUrl: string
  network: HaskoinNetwork
  address: string
  page: number
}

export type UtxoData = {
  txid: string
  index: number
  value: number
  pkscript: string
}

export type BalanceData = {
  address: Address
  confirmed: number
  unconfirmed: number
  utxo: number
  txs: number
  received: number
}

export type AddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
}

export type TxHashParams = {
  apiKey: string
  haskoinUrl: string
  network: HaskoinNetwork
  hash: TxHash
}
export interface TxIO {
  txid: number
  output: number
  script: string
  address: string
  value: number
  type?: string
}
export interface Transaction {
  txid: string
  block: Block
  confirmations: number
  time: number

  tx_hex: string
  inputs: TxIO[]
  outputs: TxIO[]
}

export interface HaskoinResponse<T> {
  data: T
  status: string
}

export type Block = {
  height: number
  position: number
}
