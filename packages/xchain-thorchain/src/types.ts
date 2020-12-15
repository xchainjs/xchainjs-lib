import { Asset, BaseAmount } from '@xchainjs/xchain-util'

export type DepositParam = {
  asset?: Asset
  amount: BaseAmount
  memo: string
}

export const THORChain = 'THOR'
export const AssetRune: Asset = { chain: THORChain, symbol: 'RUNE', ticker: 'RUNE' }
