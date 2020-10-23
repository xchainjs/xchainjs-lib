import BigNumber from 'bignumber.js'
import { chains } from './chain.const'

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
