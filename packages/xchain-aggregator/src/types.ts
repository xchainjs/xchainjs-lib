import { TxHash, Network } from '@xchainjs/xchain-client'
import { MidgardConfig } from '@xchainjs/xchain-midgard-query'
import { MidgardConfig as MayaMidgardConfig } from '@xchainjs/xchain-mayamidgard-query'
import { MayanodeConfig } from '@xchainjs/xchain-mayachain-query'
import { ThornodeConfig } from '@xchainjs/xchain-thorchain-query'
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

type TxSubmitted = {
  hash: string
  url: string
}

type Fees = {
  asset: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset
  affiliateFee: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>
  outboundFee: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>
  networkFee?: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>
}

type Protocol = 'Thorchain' | 'Mayachain' | 'Chainflip' | 'OneClick'

type AffiliateConfig = {
  /** Value must be between 0 and 10000 */
  basisPoints: number
  /** ThorNames and MayaNames are supported for Thorchain and Mayachain */
  affiliates: Partial<Record<Protocol, string>>
}

export type Config = Partial<{
  /** Undefined means all protocols are enabled */
  protocols: Protocol[]
  affiliate: AffiliateConfig
  wallet: Wallet
  /** If omitted, inferred from the wallet, otherwise mainnet */
  network: Network
  /** Chainflip only */
  affiliateBrokers: {
    account: `cF${string}` | `0x${string}`
    commissionBps: number
  }[]
  /** Chainflip only */
  brokerUrl: string
  /** NEAR Intents */
  oneClickApiKey: string
  /** Omitted from the quote body when unset */
  oneClickReferral: string
  /** When omitted, the network default THORNode endpoints are used */
  thornodeConfig: ThornodeConfig
  /** When omitted, the network default Midgard endpoints are used */
  midgardConfig: MidgardConfig
  /** When omitted, the network default MAYANode endpoints are used */
  mayanodeConfig: MayanodeConfig
  /** When omitted, the network default Maya Midgard endpoints are used */
  mayaMidgardConfig: MayaMidgardConfig
}>

export type ProtocolConfig = Partial<{
  wallet: Wallet
  affiliateBps: number
  affiliateAddress: string
  network: Network
  affiliateBrokers: {
    account: `cF${string}` | `0x${string}`
    commissionBps: number
  }[]
  brokerUrl: string
  oneClickApiKey: string
  oneClickReferral: string
  thornodeConfig: ThornodeConfig
  midgardConfig: MidgardConfig
  mayanodeConfig: MayanodeConfig
  mayaMidgardConfig: MayaMidgardConfig
}>

type QuoteSwap = {
  protocol: Protocol
  toAddress: Address
  memo: string
  expectedAmount: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>
  dustThreshold: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>
  // TODO: Update type to return an array of the fees
  fees: Fees
  totalSwapSeconds: number
  slipBasisPoints: number
  maxStreamingQuantity: number | undefined
  canSwap: boolean
  errors: string[]
  warning: string
  depositChannelId?: string
}

type QuoteSwapParams = {
  fromAsset: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset
  destinationAsset: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset
  amount: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>
  fromAddress?: string // Also used as refund address
  destinationAddress?: string
  height?: number
  toleranceBps?: number
  liquidityToleranceBps?: number // Pool swing tolerance
  streamingQuantity?: number
  streamingInterval?: number
  enableBoost?: boolean // Chainflip only
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

export type {
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
