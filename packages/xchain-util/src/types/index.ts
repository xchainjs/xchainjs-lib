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
  plus: (value: string | number | BigNumber | Amount<T>, decimal?: number) => Amount<T>
  minus: (value: string | number | BigNumber | Amount<T>, decimal?: number) => Amount<T>
  times: (value: string | number | BigNumber | Amount<T>, decimal?: number) => Amount<T>
  div: (value: string | number | BigNumber | Amount<T>, decimal?: number) => Amount<T>
  gt: (value: string | number | BigNumber | Amount<T>) => boolean
  gte: (value: string | number | BigNumber | Amount<T>) => boolean
  lt: (value: string | number | BigNumber | Amount<T>) => boolean
  lte: (value: string | number | BigNumber | Amount<T>) => boolean
  eq: (value: string | number | BigNumber | Amount<T>) => boolean
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
