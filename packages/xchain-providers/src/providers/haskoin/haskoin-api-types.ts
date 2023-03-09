/**
 * Haskoin API types
 */

import { TxHash } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

export enum HaskoinNetwork {
  BTC = 'btc',
  BTCTEST = 'btctest',
  BCH = 'bch',
  BCHTEST = 'bchtest',
}

export type AddressParams = {
  apiKey: string
  haskoinUrl: string
  network: HaskoinNetwork
  address: string
  page: number
}

// export type UtxoData = {
//   txid: string
//   index: number
//   value: number
//   pkscript: string
// }

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

export type GetTxsDTO = {
  transactions: AddressTxDTO[]
}

export type AddressTxDTO = {
  txid: string
  block: Block
  time: number
}
export type TxConfirmedStatus = {
  network: string
  txid: string
  confirmations: number
  is_confirmed: boolean
}
export type AddressUTXO = {
  address: string
  block: Block
  txid: string
  index: number
  pkscript: string
  value: string
  tx_hex: string
}
export type UnspentTxsDTO = {
  outputs: AddressUTXO[]
}
