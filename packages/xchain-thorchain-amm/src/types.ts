import { Address, FeeOption } from '@xchainjs/xchain-client'
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

export type ExecuteSwap = {
  input: CryptoAmount
  destinationAsset: Asset
  limit: BaseAmount
  destinationAddress: Address
  affiliateAddress: Address
  affiliateFee: BaseAmount
  feeOption?: FeeOption
  interfaceID: number
  waitTimeSeconds: number
}

export type TxSubmitted = {
  hash: string
  url: string
  waitTimeSeconds: number
}

export type EstimateLP = {
  slip: BigNumber
  poolShare: PoolShareDetail
  transactionFee: LPFees
  runeToAssetRatio: BigNumber
  estimatedWait: number
}

export type LiquidityDeposited = {
  assetDeposited: BaseAmount
  runeDeposited: BaseAmount
}

export type PoolShareDetail = {
  assetShare: BigNumber
  runeShare: BigNumber
}

export type LPFees = {
  runeFee: CryptoAmount
  assetFee: CryptoAmount
  TotalFees: CryptoAmount
}

export type liquidityPosition = {
  asset: CryptoAmount
  rune: CryptoAmount
  action: string
  percentage?: number
}

export type AddLiquidity = {
  asset: CryptoAmount
  rune: CryptoAmount
  action: string
  waitTimeSeconds: number
}

export type RemoveLiquidity = {
  asset: CryptoAmount
  rune: CryptoAmount
  action: string
  percentage: number
  waitTimeSeconds: number
}

export type DepositParams = {
  walletIndex?: number // send from this HD index
  asset: Asset
  amount: BaseAmount
  feeOption: FeeOption
  memo: string
}

export type SwapOutput = {
  output: BaseAmount
  swapFee: BaseAmount
  slip: BigNumber
}

export type UnitData = {
  liquidityUnits: BigNumber
  totalUnits: BigNumber
}

export type PoolRatios = {
  assetToRune: BigNumber
  runeToAsset: BigNumber
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
