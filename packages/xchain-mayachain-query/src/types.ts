import { TxHash } from '@xchainjs/xchain-client'
import {
  Address,
  Asset,
  AssetCryptoAmount,
  Chain,
  CryptoAmount,
  SecuredAsset,
  SynthAsset,
  TokenAsset,
  TradeAsset,
  TradeCryptoAmount,
} from '@xchainjs/xchain-util'
import type BigNumber from 'bignumber.js'

export type CompatibleAsset = Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset

export type Fees = {
  asset: CompatibleAsset
  affiliateFee: CryptoAmount<CompatibleAsset>
  outboundFee: CryptoAmount<CompatibleAsset>
  liquidityFee: CryptoAmount<CompatibleAsset>
  totalFee: CryptoAmount<CompatibleAsset>
}

export type QuoteSwap = {
  toAddress: Address
  memo: string
  expectedAmount: CryptoAmount<CompatibleAsset>
  dustThreshold: AssetCryptoAmount
  fees: Fees
  inboundConfirmationSeconds?: number
  inboundConfirmationBlocks?: number
  outboundDelaySeconds: number
  outboundDelayBlocks: number
  totalSwapSeconds: number
  slipBasisPoints: number
  router?: string // EVM router contract
  expiry: number // unix seconds
  // sending less can fail the refund
  recommendedMinAmountIn?: CryptoAmount
  recommendedGasRate?: string
  gasRateUnits?: string
  streamingSwapSeconds?: number
  streamingSwapBlocks?: number
  maxStreamingQuantity?: number
  canSwap: boolean
  errors: string[]
  warning: string
}

export type Affiliate = {
  address: string // address or MAYAName
  bps: number // affiliate bps, 0-500 on MAYAChain
}

export type QuoteSwapParams = {
  fromAsset: CompatibleAsset
  destinationAsset: CompatibleAsset
  amount: CryptoAmount<CompatibleAsset>
  fromAddress?: string
  destinationAddress?: string
  height?: number
  liquidityToleranceBps?: number
  toleranceBps?: number
  affiliateBps?: number // mutually exclusive with affiliates
  affiliateAddress?: string // mutually exclusive with affiliates
  // Multi-affiliate form. MAYAChain accepts up to 5 affiliates per swap with per-affiliate bps;
  // each bps must be 0-500. Mutually exclusive with the singular affiliateAddress / affiliateBps.
  affiliates?: Affiliate[]
  streamingInterval?: number
  streamingQuantity?: number
}

export type InboundDetail = {
  chain: Chain
  address: Address
  router?: Address
  gasRate: BigNumber
  gasRateUnits: string
  outboundTxSize: BigNumber
  outboundFee: BigNumber
  haltedChain: boolean
  haltedTrading: boolean
  haltedLP: boolean
}

export type SwapHistoryParams = {
  addresses: Address[]
}

export type TransactionAction = {
  hash: TxHash
  address: Address
  amount: CryptoAmount<CompatibleAsset>
}

export type SuccessSwap = {
  date: Date
  fromAsset: CompatibleAsset
  toAsset: CompatibleAsset
  status: 'success'
  inboundTx: TransactionAction
  outboundTx: TransactionAction
}

export type PendingSwap = {
  date: Date
  fromAsset: CompatibleAsset
  toAsset: CompatibleAsset
  status: 'pending'
  inboundTx: TransactionAction
}

export type Swap = SuccessSwap | PendingSwap

export type SwapsHistory = {
  swaps: Swap[]
  count: number
}

export type MAYANameAlias = {
  chain: Chain
  address: Address
}

export type MAYANameDetails = {
  name: string
  expireBlockHeight: number
  owner: string
  preferredAsset?: string
  affiliateCollectorCacao?: string
  aliases: MAYANameAlias[]
}

export type RegisterMAYAName = {
  name: string
  owner: Address
  expiry?: Date // defaults to about one year
  chain: Chain
  chainAddress: Address
  preferredAsset?: Asset // asset fees are received in
}

export type UpdateMAYAName = {
  name: string
  owner?: Address // omitted: memo uses the current owner
  expiry?: Date
  chain?: Chain // omitted: memo uses a registered chain
  chainAddress?: Address // omitted: memo uses the returned chain's address
  preferredAsset?: Asset // asset fees are received in
}

export type QuoteMAYANameParams = (RegisterMAYAName & { isUpdate?: false }) | (UpdateMAYAName & { isUpdate: true })

export type QuoteMAYAName = {
  memo: string
  value: AssetCryptoAmount
}

export type TradeAssetUnitsParams = {
  asset: TradeAsset
  height?: number
}

export type TradeAssetUnits = {
  asset: TradeAsset
  units: TradeCryptoAmount
  depth: TradeCryptoAmount
}

export type TradeAssetsUnitsParams = {
  height?: number
}

export type AddressTradeAccountsParams = {
  address: Address
  height?: number
}

export type AddressTradeAccount = {
  asset: TradeAsset
  units: TradeCryptoAmount
  owner: Address
  lastAddHeight?: number // MAYAChain height of last add
  lastWithdrawHeight?: number // MAYAChain height of last withdraw
}

export type AddressTradeAccounts = AddressTradeAccount[]

export type TradeAssetAccountsParams = {
  asset: TradeAsset
  height?: number
}

export type TradeAssetAccounts = AddressTradeAccount[]
