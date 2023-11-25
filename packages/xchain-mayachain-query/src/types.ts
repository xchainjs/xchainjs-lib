import { Address, Asset, CryptoAmount } from '@xchainjs/xchain-util'

/**
 * Quote swap types
 */
export type Fees = {
  asset: Asset
  affiliateFee: CryptoAmount
  outboundFee: CryptoAmount
}

export type QuoteSwap = {
  toAddress: Address
  memo: string
  expectedAmount: CryptoAmount
  dustThreshold: CryptoAmount
  fees: Fees
  inboundConfirmationSeconds?: number
  inboundConfirmationBlocks?: number
  outboundDelaySeconds: number
  outboundDelayBlocks: number
  totalSwapSeconds: number
  slipBasisPoints: number
  canSwap: boolean
  errors: string[]
  warning: string
}

export type QuoteSwapParams = {
  fromAsset: Asset
  destinationAsset: Asset
  amount: CryptoAmount
  fromAddress?: string
  destinationAddress?: string
  height?: number
  toleranceBps?: number
  affiliateBps?: number
  affiliateAddress?: string
}
