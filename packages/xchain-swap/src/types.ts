import { Address } from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from './LiquidityPool'

export type TotalFees = {
  inboundFee: BaseAmount
  swapFee: BaseAmount
  outboundFee: BaseAmount
  affiliateFee: BaseAmount
}

export type SwapEstimate = {
  totalFees: TotalFees
  slipPercentage: BigNumber
  netOutput: BaseAmount
  waitTime: number
  canSwap: boolean
  errors?: string[]
}

export type PoolCache = {
  lastRefreshed: number
  pools: Record<string, LiquidityPool>
}

export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
}

export type EstimateSwapParams = {
  sourceAsset: Asset
  inputAmount: BaseAmount
  destinationAsset: Asset
  affiliateFeePercent?: number
  slipLimit?: BigNumber
}

export type ExecuteSwap = {
  fromBaseAmount: BaseAmount
  sourceAsset: Asset
  destinationAsset: Asset
  limit: BaseAmount
  destinationAddress: Address
  affiliateAddress: Address
  affiliateFee: BaseAmount
  interfaceID: number
  waitTime: number
}

export type SwapSubmitted = {
  hash: string
  url: string
  waitTime: number
}

export type DepositParams = {
  walletIndex?: number // send from this HD index
  asset: Asset
  amount: BaseAmount
  memo: string
}

export type SwapOutput = {
  output: BaseAmount
  swapFee: BaseAmount
  slip: BigNumber
}

export type UnitData = {
  liquidityUnits: BaseAmount
  totalUnits: BaseAmount
}

export type LiquidityData = {
  // assetDeposit: BaseAmount
  rune: BaseAmount
  asset: BaseAmount
}

export type Block = {
  current: number
  lastAdded: number
  fullProtection: number
}

export type Coverage = {
  poolRatio: BaseAmount
}

export type InboundDetail = {
  vault: string
  router?: string
  haltedChain: boolean
  haltedTrading: boolean
  haltedLP: boolean
  gas_rate: BigNumber
}

export type ConfCountingSetting = {
  blockReward: number
  avgBlockTimeInSecs: number
}
