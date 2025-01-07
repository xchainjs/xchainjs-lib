import { TxHash } from '@xchainjs/xchain-client'
import {
  Address,
  AnyAsset,
  Asset,
  Chain,
  CryptoAmount,
  SecuredAsset,
  SynthAsset,
  TokenAsset,
  TradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

/**
 * TxSubmitted
 */
type TxSubmitted = {
  hash: string
  url: string
}

/**
 * Fees
 */
type Fees = {
  asset: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset // The asset for which fees are calculated
  affiliateFee: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset> // The affiliate fee amount
  outboundFee: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset> // The outbound fee amount
}

/**
 * Protocols supported by the Aggregator
 */
type Protocol = 'Thorchain' | 'Mayachain' | 'Chainflip'

/**
 * Affiliate config for the aggregator
 */
type AffiliateConfig = {
  /**
   * Basis points for the affiliate fee calculation. Value must be between 0 and 10000
   */
  basisPoints: number
  /**
   * Affiliate address by protocol. ThorNames and MayaNames are supported for Thorchain and Mayachain protocols
   */
  affiliates: Partial<Record<Protocol, string>>
}

/**
 * Aggregator config
 */
export type Config = Partial<{
  /**
   * List of protocols to enable. Undefined value means all protocols enabled
   */
  protocols: Protocol[]
  /**
   * Affiliate config
   */
  affiliate: AffiliateConfig
  /**
   * Wallet
   */
  wallet: Wallet
}>

/**
 * Protocol config
 */
export type ProtocolConfig = Partial<{
  wallet: Wallet
  affiliateBps: number
  affiliateAddress: string
}>

/**
 * Represents a quote for a swap operation.
 */
type QuoteSwap = {
  protocol: Protocol
  toAddress: Address // The destination address for the swap
  memo: string // The memo associated with the swap
  expectedAmount: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset> // The expected amount to be received after the swap
  dustThreshold: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset> // The dust threshold for the swap
  // TODO: Update type to return an array of the fees
  fees: Fees // The fees associated with the swap
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
  fromAsset: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset // The asset to swap from
  destinationAsset: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset // The asset to swap to
  amount: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset> // The amount to swap
  fromAddress?: string // The source address for the swap
  destinationAddress?: string // The destination address for the swap
  height?: number // The block height for the swap
  toleranceBps?: number // The tolerance basis points for the swap
  streamingQuantity?: number // The streaming quantity for the swap
  streamingInterval?: number // The streaming interval for the swap
}

type SwapHistoryParams = {
  chainAddresses: { address: Address; chain: Chain }[]
}

type TransactionAction = {
  hash: TxHash
  address: Address
  amount: CryptoAmount
}

type SuccessSwap = {
  protocol: Protocol
  date: Date
  fromAsset: AnyAsset
  toAsset: AnyAsset
  status: 'success'
  inboundTx: TransactionAction
  outboundTx: TransactionAction
}

type PendingSwap = {
  protocol: Protocol
  date: Date
  fromAsset: AnyAsset
  toAsset: AnyAsset
  status: 'pending'
  inboundTx: TransactionAction
}

type SwapResume = SuccessSwap | PendingSwap

type SwapHistory = {
  count: number
  swaps: SwapResume[]
}

type ApproveParams = {
  asset: TokenAsset
  amount?: CryptoAmount
}

type IsApprovedParams = {
  asset: TokenAsset
  amount: CryptoAmount
  address: string
}

interface IProtocol {
  name: Protocol
  isAssetSupported(asset: AnyAsset): Promise<boolean>
  getSupportedChains(): Promise<Chain[]>
  estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap>
  doSwap(params: QuoteSwapParams): Promise<TxSubmitted>
  getSwapHistory(params: SwapHistoryParams): Promise<SwapHistory>
  approveRouterToSpend(params: ApproveParams): Promise<TxSubmitted>
  shouldBeApproved(params: IsApprovedParams): Promise<boolean>
}

export {
  IProtocol,
  QuoteSwapParams,
  QuoteSwap,
  TxSubmitted,
  Protocol,
  SwapHistory,
  SuccessSwap,
  PendingSwap,
  SwapResume,
  SwapHistoryParams,
  ApproveParams,
  IsApprovedParams,
}
