import { TxHash } from '@xchainjs/xchain-client'

export enum BlockcypherNetwork {
  BTC = 'btc/main',
  BTCTEST = 'btc/test3',
  LTC = 'ltc/main',
  DOGE = 'doge/main',
  DASH = 'dash/main',
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
  limit?: number
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
  txrefs?: AddressTxDTO[]
  unconfirmed_txrefs?: { tx_hash: string }[]
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

export type Blockchain = {
  name: string // The name of the blockchain represented, in the form of $COIN.$CHAIN
  height: number // The current height of the blockchain; i.e., the number of blocks in the blockchain
  hash: string // The hash of the latest confirmed block in the blockchain
  time: string // The time of the latest update to the blockchain; typically when the latest block was added.
  latest_url: string // The BlockCypher URL to query for more information on the latest confirmed block; returns a Block
  previous_hash: string // The hash of the second-to-latest confirmed block in the blockchain
  previous_url: string // The BlockCypher URL to query for more information on the second-to-latest confirmed block; returns a Block
  high_fee_per_kb: number // A rolling average of the fee (in satoshis) paid per kilobyte for transactions to be confirmed within 1 to 2 blocks
  medium_fee_per_kb: number // A rolling average of the fee (in satoshis) paid per kilobyte for transactions to be confirmed within 3 to 6 blocks
  low_fee_per_kb: number // A rolling average of the fee (in satoshis) paid per kilobyte for transactions to be confirmed in 7 or more blocks
  unconfirmed_count: number // Number of unconfirmed transactions in memory pool (likely to be included in next block)
  last_fork_height?: number // The current height of the latest fork to the blockchain; when no competing blockchain fork present, not returned with endpoints that return Blockchains
  last_fork_hash?: number // The hash of the latest confirmed block in the latest fork of the blockchain; when no competing blockchain fork present, not returned with endpoints that return Blockchains
}

export type ChainResponse = Blockchain
