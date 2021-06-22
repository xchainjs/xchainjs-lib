import { Asset, BaseAmount } from '@xchainjs/xchain-util'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AssumeFunction<T> = T extends (...args: any[]) => any ? T : never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AssumeAsyncFunction<T> = T extends (...args: any[]) => Promise<any> ? T : never
export type AssumePromise<T> = T extends Promise<unknown> ? T : never
export type PromiseType<T> = T extends Promise<infer R> ? R : never

export type Network = 'testnet' | 'mainnet'
export type Address = string
export type TxHash = string

export enum FeeOption {
  Average = 'average',
  Fast = 'fast',
  Fastest = 'fastest',
}

export enum FeeType {
  FlatFee = 'base',
  PerByte = 'byte',
}

export type Fees = Record<FeeOption, BaseAmount> & {
  type: FeeType
}

export type Balance = {
  asset: Asset
  amount: BaseAmount
}

export type TxFrom = {
  from: Address | TxHash
  amount: BaseAmount
}

export type TxTo = {
  to: Address
  amount: BaseAmount
}

export enum TxType {
  Transfer = 'transfer',
  Unknown = 'unknown',
}

export type Tx = {
  asset: Asset
  from: TxFrom[]
  to: TxTo[]
  date: Date
  type: TxType
  hash: string
}

export type TxsPage = {
  total: number
  txs: Tx[]
}

export interface Explorer {
  url: string
  getAddressUrl(address: Address): string
  getTxUrl(txID: string): string
}

export interface ClientParams {
  explorer: Readonly<Explorer>
  getFullDerivationPath: (index: number) => string
}
