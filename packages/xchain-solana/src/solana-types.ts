import { Address } from '@solana/addresses'

type TokenAmount = {
  amount: string
  decimals: number
  uiAmount: number
  uiAmountString: number
}

type Info = {
  isNative: false
  mint: Address
  owner: Address
  state: 'initialized'
  tokenAmount: TokenAmount
}

export type TokenAssetData = {
  info: Info
  type: 'account'
}
