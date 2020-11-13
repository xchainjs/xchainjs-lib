import { Asset } from '@xchainjs/xchain-util'

export const Polkadot = 'THOR'
export const AssetDOT: Asset = { chain: Polkadot, symbol: 'DOT', ticker: 'DOT' }

export type SubscanResponse<T> = {
  code: number
  message: string
  ttl: number
  data?: T
}

export type Account = {
  address: string
  balance: string
  lock: string
}

export type AccountDisplay = {
  address: string
  identity: boolean
}

export type Transfer = {
  from: string
  to: string
  extrinsic_index: string
  success: boolean
  hash: string
  block_num: number
  block_timestamp: number
  module: string
  amount: string
  fee: string
  nonce: number
  from_account_display: AccountDisplay
  to_account_display: AccountDisplay
}

export type Transfers = Array<Transfer>

export type TransfersResult = {
  count: number
  transfers?: Array<Transfer>
}
