import { Asset, CryptoAmount, TokenAsset } from '@xchainjs/xchain-util'

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

export type OneClickAppFee = {
  recipient: string
  fee: number
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
  appFees?: OneClickAppFee[]
  /** Stamped from Aggregator `oneClickReferral` when configured. */
  referral?: string
}

export type OneClickQuoteInner = {
  amountOut: string
  amountOutFormatted?: string
  timeEstimate?: number
  depositAddress?: string
}

export type OneClickQuoteResponse = {
  quote?: OneClickQuoteInner
  /** Echo of the request; used to resolve applied appFees after server-side splits. */
  quoteRequest?: Pick<OneClickQuoteRequest, 'appFees'>
  correlationId?: string
  error?: string
  message?: string
  statusCode?: number
}

/**
 * Executable OneClick order from a wet quote (`dry: false`).
 * Open immediately before broadcast; do not reuse the deposit address across quotes.
 */
export type OneClickDepositQuote = {
  depositAddress: string
  /** Egress amount from the wet quote bound to this deposit address. */
  expectedAmount: CryptoAmount
  correlationId?: string
}
