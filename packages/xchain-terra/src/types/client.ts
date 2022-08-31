import type { Network } from '@xchainjs/xchain-client'
import { Address, Asset, BaseAmount } from '@xchainjs/xchain-util/lib'

export type SearchTxParams = {
  messageAction?: string
  messageSender?: string
  transferSender?: string
  transferRecipient?: string
  page?: number
  limit?: number
  txMinHeight?: number
  txMaxHeight?: number
}

export type ClientParams = {
  explorerURL?: string
  explorerAddressURL?: string
  explorerTxURL?: string
  cosmosAPIURL?: string
  chainID?: string
}

export type ClientConfig = {
  explorerURL: string
  explorerAddressURL: string
  explorerTxURL: string
  cosmosAPIURL: string
  chainID: string
}

export type ClientConfigs = Record<Network, ClientConfig>

export type FeeParams = {
  asset: Asset
  feeAsset: Asset
  amount: BaseAmount
  recipient: Address
  sender: Address
  memo?: string
}
