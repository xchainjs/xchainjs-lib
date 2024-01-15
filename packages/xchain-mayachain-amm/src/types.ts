import { Address, Asset, CryptoAmount } from '@xchainjs/xchain-util'

export type TxSubmitted = {
  hash: string
  url: string
}

export type ApproveParams = {
  asset: Asset
  amount: CryptoAmount | undefined
}

export type IsApprovedParams = {
  asset: Asset
  amount: CryptoAmount
  address: Address
}
