import { Fees } from '@xchainjs/xchain-client'
import { Address, Asset, CryptoAmount } from '@xchainjs/xchain-util'

type TxSubmitted = {
  hash: string
  url: string
}

type QuoteSwap = {
  toAddress: Address // The destination address for the swap
  memo: string // The memo associated with the swap
  expectedAmount: CryptoAmount // The expected amount to be received after the swap
  dustThreshold: CryptoAmount // The dust threshold for the swap
  fees: Fees // The fees associated with the swap
  inboundConfirmationSeconds?: number // The inbound confirmation time in seconds
  inboundConfirmationBlocks?: number // The inbound confirmation time in blocks
  outboundDelaySeconds: number // The outbound delay time in seconds
  outboundDelayBlocks: number // The outbound delay time in blocks
  totalSwapSeconds: number // The total time for the swap operation
  slipBasisPoints: number // The slip basis points for the swap
  canSwap: boolean // Indicates whether the swap can be performed
  errors: string[] // Any errors encountered during the swap operation
  warning: string // Any warning messages associated with the swap
}

/**
 * Represents parameters for quoting a swap operation.
 */
type QuoteSwapParams = {
  fromAsset: Asset // The asset to swap from
  destinationAsset: Asset // The asset to swap to
  amount: CryptoAmount // The amount to swap
  fromAddress?: string // The source address for the swap
  destinationAddress?: string // The destination address for the swap
  height?: number // The block height for the swap
  toleranceBps?: number // The tolerance basis points for the swap
  affiliateBps?: number // The affiliate basis points for the swap
  affiliateAddress?: string // The affiliate address for the swap
}

interface IProtocol {
  isAssetSupported(asset: Asset): Promise<boolean>
  estimateSwap(params: QuoteSwap): Promise<QuoteSwap>
  validateSwap(params: QuoteSwap): Promise<string[]>
  doSwap(params: QuoteSwap): Promise<TxSubmitted>
}

export { IProtocol, QuoteSwapParams, QuoteSwap, TxSubmitted }
