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
