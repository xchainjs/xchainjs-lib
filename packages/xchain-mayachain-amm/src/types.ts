import { Address, Asset, BaseAmount } from '@xchainjs/xchain-util'

export type TxSubmitted = {
  hash: string
  url: string
}

export type ApproveParams = {
  asset: Asset
  amount: BaseAmount | undefined
}

export type IsApprovedParams = {
  asset: Asset
  amount: BaseAmount
  address: Address
}
