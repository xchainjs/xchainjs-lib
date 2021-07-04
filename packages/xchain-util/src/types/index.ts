import BigNumber from 'bignumber.js'

import { chains } from '../chain.const'

export enum Denomination {
  /**
   * values for asset amounts in base units (no decimal)
   */
  BASE = 'BASE',
  /**
   * values of asset amounts (w/ decimal)
   */
  ASSET = 'ASSET',
}

type Amount<T> = {
  type: T
  amount: () => BigNumber
  plus: (value: BigNumber.Value | Amount<T>, decimal?: number) => Amount<T>
  minus: (value: BigNumber.Value | Amount<T>, decimal?: number) => Amount<T>
  times: (value: BigNumber.Value | Amount<T>, decimal?: number) => Amount<T>
  div: (value: BigNumber.Value | Amount<T>, decimal?: number) => Amount<T>
  gt: (value: BigNumber.Value | Amount<T>) => boolean
  gte: (value: BigNumber.Value | Amount<T>) => boolean
  lt: (value: BigNumber.Value | Amount<T>) => boolean
  lte: (value: BigNumber.Value | Amount<T>) => boolean
  eq: (value: BigNumber.Value | Amount<T>) => boolean
  decimal: number
}

export type BaseAmount = Amount<Denomination.BASE>
export type AssetAmount = Amount<Denomination.ASSET>

export type Amounts = AssetAmount | BaseAmount

// Chain type to includes types of all possible chains
export type Chain = typeof chains[number]

export type Asset = {
  chain: Chain
  symbol: string
  ticker: string
}

type OnlyRequiredKeys<T, U = keyof T> = U extends keyof T ? (undefined extends T[U] ? never : U) : never
export type OnlyRequired<T> = Pick<T, OnlyRequiredKeys<T>>
