import { TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, Chain, CryptoAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

/**
 * Represents fees associated with a swap.
 */
export type Fees = {
  asset: Asset // The asset for which fees are calculated
  affiliateFee: CryptoAmount // The affiliate fee amount
  outboundFee: CryptoAmount // The outbound fee amount
}

/**
 * Represents a quote for a swap operation.
 */
export type QuoteSwap = {
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
export type QuoteSwapParams = {
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

/**
 * Represents details about an inbound address.
 */
export type InboundDetail = {
  chain: Chain // The chain associated with the inbound address
  address: Address // The inbound address
  router?: Address // The router address
  gasRate: BigNumber // The gas rate
  gasRateUnits: string // The units of the gas rate
  outboundTxSize: BigNumber // The outbound transaction size
  outboundFee: BigNumber // The outbound fee
  haltedChain: boolean // Indicates if the chain is halted
  haltedTrading: boolean // Indicates if trading is halted
  haltedLP: boolean // Indicates if LP (liquidity provision) is halted
}

export type SwapHistoryParams = {
  addresses: Address[]
}

/**
 * Transaction action
 */
export type TransactionAction = {
  hash: TxHash
  address: Address
  amount: CryptoAmount
}

/**
 * Swap resume
 */
export type Swap = {
  date: Date
  status: 'success' | 'pending'
  inboundTx: TransactionAction
  outboundTx: TransactionAction
}

/**
 * Swap history
 */
export type SwapsHistory = {
  swaps: Swap[]
  count: number
}
