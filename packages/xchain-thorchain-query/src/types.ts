import { InboundAddressesItem } from '@xchainjs/xchain-midgard'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from './crypto-amount'
import { LiquidityPool } from './liquidity-pool'

export type TotalFees = {
  inboundFee: CryptoAmount
  swapFee: CryptoAmount
  outboundFee: CryptoAmount
  affiliateFee: CryptoAmount
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

export type AsgardCache = {
  lastRefreshed: number
  inboundAddressesItems: Record<string, InboundAddressesItem>
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
  affiliateFeePercent?: number
  slipLimit?: BigNumber
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
  rune: BigNumber
  asset: BigNumber
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

export type ChainAttributes = {
  blockReward: number
  avgBlockTimeInSecs: number
}
