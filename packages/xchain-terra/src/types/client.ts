import type { Network } from '@xchainjs/xchain-client'

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
  ChainID?: string
}

export type ClientConfig = {
  explorerURL: string
  explorerAddressURL: string
  explorerTxURL: string
  cosmosAPIURL: string
  ChainID: string
}

export type ClientConfigs = Record<Network, ClientConfig>
