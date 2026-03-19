import { Asset, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset

export type OneClickToken = {
  assetId: string
  blockchain: string
  symbol: string
  decimals: number
  contractAddress?: string
  price?: number
  priceUpdatedAt?: string
}

export type OneClickQuoteRequest = {
  dry?: boolean
  swapType: 'EXACT_INPUT'
  depositType: 'ORIGIN_CHAIN'
  recipientType: 'DESTINATION_CHAIN'
  refundType: 'ORIGIN_CHAIN'
  originAsset: string
  destinationAsset: string
  amount: string
  refundTo: string
  recipient: string
  slippageTolerance?: number
  deadline?: string
  appFees?: { recipient: string; fee: number }[]
}

export type OneClickQuoteInner = {
  amountOut: string
  amountOutFormatted?: string
  timeEstimate?: number
  depositAddress?: string
}

export type OneClickQuoteResponse = {
  quote: OneClickQuoteInner
  error?: string
  message?: string
  statusCode?: number
}
