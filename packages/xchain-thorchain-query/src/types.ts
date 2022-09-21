import { FeeOption } from '@xchainjs/xchain-client'
import { InboundAddressesItem } from '@xchainjs/xchain-midgard'
import { Address, Asset, BaseAmount } from '@xchainjs/xchain-util'
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
  destinationAddress: Address
  affiliateAddress?: Address
  interfaceID?: number
  affiliateFeePercent?: number
  slipLimit?: BigNumber
}

export type SwapOutput = {
  output: CryptoAmount
  swapFee: CryptoAmount
  slip: BigNumber
}

export type UnitData = {
  liquidityUnits: BaseAmount
  totalUnits: BaseAmount
}

export type LiquidityData = {
  rune: CryptoAmount
  asset: CryptoAmount
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
export type ConstructMemo = {
  input: CryptoAmount
  destinationAsset: Asset
  limit: BaseAmount
  destinationAddress: Address
  affiliateAddress: Address
  affiliateFee: BaseAmount
  feeOption?: FeeOption
  interfaceID: number
}

export type TxDetails = {
  memo: string
  toAddress: string
  expiry: Date
  txEstimate: SwapEstimate
}

export enum TxStage {
  INBOUND_CHAIN_UNCONFIRMED,
  CONF_COUNTING,
  TC_PROCESSING,
  OUTBOUND_QUEUED,
  OUTBOUND_CHAIN_UNCONFIRMED,
  OUTBOUND_CHAIN_CONFIRMED,
}
export type TxStatus = {
  stage: TxStage
  seconds: number
}

export type LiquidityToAdd = {
  asset: BaseAmount
  rune: BaseAmount
}
export type PostionDepositValue = {
  asset: BaseAmount
  rune: BaseAmount
}

export type PoolShareDetail = {
  assetShare: BigNumber
  runeShare: BigNumber
}

export type EstimateADDLP = {
  slip: BigNumber
  poolShare: PoolShareDetail
  lpUnits: BaseAmount
  transactionFee: LPFees
  runeToAssetRatio: BigNumber
  estimatedWait: number
}
export type EstimateWithdrawLP = {
  slip: BigNumber
  estimatedWait: number
  transactionFee: LPFees
  assetAmount: CryptoAmount
  runeAmount: CryptoAmount
  impermanentLossProtection: number
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
  action: string
}
export type RemoveLiquidityPosition = {
  asset: Asset
  action: string
  percentage: number
  assetAddress: string
  runeAddress?: string
  withdrawType: string
}
export type LiquidityPosition = {
  position: LiquidityProvider
  impermanentLossProtection: number
}

export type PoolRatios = {
  assetToRune: BigNumber
  runeToAsset: BigNumber
}
export type LiquidityProvider = {
  asset: string
  rune_address: string
  asset_address: string
  last_add_height: number
  last_withdraw_height: number
  units: number
  pending_rune: number
  pending_asset: number
  pending_tx_Id: string
  rune_deposit_value: number
  asset_deposit_value: number
}
