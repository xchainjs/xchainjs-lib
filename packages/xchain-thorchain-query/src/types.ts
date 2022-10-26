import { FeeOption } from '@xchainjs/xchain-client'
import { LiquidityProvider } from '@xchainjs/xchain-thornode'
import { Address, Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from './crypto-amount'
import { LiquidityPool } from './liquidity-pool'

export type TotalFees = {
  inboundFee: CryptoAmount
  swapFee: CryptoAmount
  outboundFee: CryptoAmount
  affiliateFee: CryptoAmount
  // totalFees?: CryptoAmount
}

export type SwapEstimate = {
  totalFees: TotalFees
  slipPercentage: BigNumber
  netOutput: CryptoAmount
  waitTimeSeconds: number
  canSwap: boolean
  errors: string[]
}

export type PoolCache = {
  lastRefreshed: number
  pools: Record<string, LiquidityPool>
}

export type InboundDetailCache = {
  lastRefreshed: number
  inboundDetails: Record<string, InboundDetail>
}
export type NetworkValuesCache = {
  lastRefreshed: number
  networkValues: Record<string, number>
}

export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
}

export type EstimateSwapParams = {
  input: CryptoAmount
  destinationAsset: Asset
  destinationAddress: Address
  slipLimit?: BigNumber
  affiliateAddress?: Address
  affiliateFeeBasisPoints?: number
  interfaceID?: string
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
  transactionFee: LPFees
  runeToAssetRatio: BigNumber
  estimatedWaitSeconds: number
  errors: string[]
  canAdd: boolean
}
export type EstimateWithdrawLP = {
  assetAddress?: string
  runeAddress?: string
  slipPercent: BigNumber
  transactionFee: LPFees
  assetAmount: CryptoAmount
  runeAmount: CryptoAmount
  impermanentLossProtection: ILProtectionData
  estimatedWaitSeconds: number
  assetPool: string
}

export type LPFees = {
  runeFee: CryptoAmount
  assetFee: CryptoAmount
  totalFees: CryptoAmount
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
  position: LiquidityProvider
  impermanentLossProtection: ILProtectionData
}

export type PoolRatios = {
  assetToRune: BigNumber
  runeToAsset: BigNumber
}
