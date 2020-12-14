import { Asset } from '@xchainjs/xchain-util'

export type TransferAmount = {
  value: number
  denom: string
}

export const THORChain = 'THOR'
export const AssetRune: Asset = { chain: THORChain, symbol: 'RUNE', ticker: 'RUNE' }
