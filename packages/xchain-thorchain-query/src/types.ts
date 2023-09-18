import { FeeOption } from '@xchainjs/xchain-client'
import { LiquidityProviderSummary } from '@xchainjs/xchain-thornode'
import { Address, Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from './crypto-amount'

export type TotalFees = {
  asset: Asset
  affiliateFee: CryptoAmount
  outboundFee: CryptoAmount
}

export type SwapEstimate = {
  netOutput: CryptoAmount
  totalFees: TotalFees
  netOutputStreaming: CryptoAmount
  maxStreamingQuantity: number
  inboundConfirmationSeconds?: number
  outboundDelaySeconds: number
  outboundDelayBlocks: number
  recommendedMinAmountIn?: string
  slipBasisPoints: number
  streamingSlipBasisPoints: number
  streamingSwapBlocks: number
  streamingSwapSeconds: number
  totalSwapSeconds: number
  canSwap: boolean
  errors: string[]
  warning: string
}

export type QuoteSwapParams = {
  fromAsset: Asset
  destinationAsset: Asset
  amount: CryptoAmount
  destinationAddress?: string
  streamingInterval?: number
  streamingQuantity?: number
  fromAddress?: string
  toleranceBps?: number
  affiliateAddress?: string
  affiliateBps?: number
  height?: number
  interfaceID?: string
  feeOption?: FeeOption
}

export type SwapOutput = {
  output: CryptoAmount
  swapFee: CryptoAmount
  slip: BigNumber
}

export type UnitData = {
  liquidityUnits: BigNumber
  totalUnits: BigNumber
}

export type LiquidityData = {
  rune: CryptoAmount
  asset: CryptoAmount
}

export type Block = {
  current: number
  lastAdded?: number
  fullProtection: number
}

export type ILProtectionData = {
  ILProtection: CryptoAmount
  totalDays: string
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

export type ChainAttributes = {
  blockReward: number
  avgBlockTimeInSecs: number
}
export type ConstructMemo = {
  input: CryptoAmount
  destinationAsset: Asset
  limit: BaseAmount
  destinationAddress: Address
  affiliateAddress: Address
  affiliateFeeBasisPoints: number
  feeOption?: FeeOption
  interfaceID: string
}

export type TxDetails = {
  memo: string
  dustThreshold: CryptoAmount
  toAddress: Address
  expiry: Date
  txEstimate: SwapEstimate
}

export type TransactionProgress = {
  progress: number
  seconds: number
  errors: string[]
}
export type TransactionStatus = {
  seconds: number
  error: string[]
}

export type LiquidityToAdd = {
  asset: CryptoAmount
  rune: CryptoAmount
}
export type PostionDepositValue = {
  asset: BaseAmount
  rune: BaseAmount
}

export type PoolShareDetail = {
  assetShare: CryptoAmount
  runeShare: CryptoAmount
}

export type EstimateAddLP = {
  assetPool: string
  slipPercent: BigNumber
  poolShare: PoolShareDetail
  lpUnits: BaseAmount
  inbound: {
    fees: LPAmounts
  }
  runeToAssetRatio: BigNumber
  estimatedWaitSeconds: number
  recommendedMinAmountIn?: string
  errors: string[]
  canAdd: boolean
}
export type EstimateWithdrawLP = {
  assetAddress?: string
  runeAddress?: string
  slipPercent: BigNumber
  inbound: {
    minToSend: LPAmounts
    fees: LPAmounts
  }
  outboundFee: LPAmounts
  assetAmount: CryptoAmount
  runeAmount: CryptoAmount
  lpGrowth: string
  impermanentLossProtection: ILProtectionData
  estimatedWaitSeconds: number
  assetPool: string
}
export type LPAmounts = {
  rune: CryptoAmount
  asset: CryptoAmount
  total: CryptoAmount
}

export type DustValues = {
  asset: CryptoAmount
  rune: CryptoAmount
}
export type AddliquidityPosition = {
  asset: CryptoAmount
  rune: CryptoAmount
}
export type WithdrawLiquidityPosition = {
  asset: Asset
  percentage: number
  assetAddress?: string
  runeAddress?: string
}
export type LiquidityPosition = {
  poolShare: PoolShareDetail
  position: LiquidityProviderSummary
  lpGrowth: string
  impermanentLossProtection: ILProtectionData
}

export type PoolRatios = {
  assetToRune: BigNumber
  runeToAsset: BigNumber
}

export type getSaver = {
  asset: Asset
  address: Address
  height?: number
}

export type EstimateAddSaver = {
  assetAmount: CryptoAmount
  estimatedDepositValue: CryptoAmount
  slipBasisPoints: number
  fee: SaverFees
  expiry: Date
  toAddress: Address
  memo: string
  saverCapFilledPercent: number
  estimatedWaitTime: number
  recommendedMinAmountIn?: string
  canAddSaver: boolean
  errors: string[]
}

export type EstimateWithdrawSaver = {
  dustAmount: CryptoAmount
  dustThreshold: CryptoAmount
  expectedAssetAmount: CryptoAmount
  fee: SaverFees
  expiry: Date
  toAddress: Address
  memo: string
  outBoundDelayBlocks: number
  outBoundDelaySeconds: number
  slipBasisPoints: number
  errors: string[]
}

export type SaverFees = {
  affiliate: CryptoAmount
  asset: Asset
  liquidity: CryptoAmount
  outbound: CryptoAmount
  totalBps: number
}

export type QuoteFees = {
  asset: string
  liquidity?: string
  outbound?: string
  total_bps?: number
}

export type SaversPosition = {
  depositValue: CryptoAmount
  redeemableValue: CryptoAmount
  lastAddHeight: number
  percentageGrowth: number
  ageInYears: number
  ageInDays: number
  asset: Asset
  errors: string[]
}

export type SaversWithdraw = {
  height?: number
  asset: Asset
  address: Address
  withdrawBps: number
}

export type LoanOpenParams = {
  asset: Asset
  amount: CryptoAmount
  targetAsset: Asset
  destination: string
  height?: number
  minOut?: string
  affiliateBps?: number
  affiliate?: string
}

export type LoanCloseParams = {
  asset: Asset
  amount: CryptoAmount
  loanAsset: Asset
  loanOwner: Address
  minOut?: string
  height?: number
}

export type LoanOpenQuote = {
  inboundAddress?: string
  expectedWaitTime: BlockInformation
  fees: QuoteFees
  slippageBps?: number
  router?: string
  expiry: number
  warning: string
  notes: string
  dustThreshold?: string
  recommendedMinAmountIn?: string
  memo?: string
  expectedAmountOut: string
  expectedCollateralizationRatio: string
  expectedCollateralDeposited: string
  expectedDebtIssued: string
  errors: string[]
}
export type LoanCloseQuote = {
  inboundAddress?: string
  expectedWaitTime: BlockInformation
  fees: QuoteFees
  slippageBps?: number
  router?: string
  expiry: number
  warning: string
  notes: string
  dustThreshold?: string
  recommendedMinAmountIn?: string
  memo?: string
  expectedAmountOut: string
  expectedCollateralWithdrawn: string
  expectedDebtRepaid: string
  errors: string[]
}

export type BlockInformation = {
  inboundConfirmationBlocks?: number
  inboundConfirmationSeconds?: number
  outboundDelayBlocks?: number
  outbondDelaySeconds?: number
}
