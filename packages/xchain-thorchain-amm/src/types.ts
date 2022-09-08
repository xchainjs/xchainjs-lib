import { FeeOption } from '@xchainjs/xchain-client'
import { CryptoAmount, LiquidityPool } from '@xchainjs/xchain-thorchain-query'
import { Address, Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
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

export type AddLiquidity = {
  asset: CryptoAmount
  rune: CryptoAmount
  action: string
  waitTimeSeconds: number
}

export type LiquidityPosition = {
  assetPool: LiquidityPool
  assetAmount: CryptoAmount
  runeAmount: CryptoAmount
  impermanentLossProtection: number
}

export type RemoveLiquidity = {
  asset: CryptoAmount
  rune: CryptoAmount
  action: string
  percentage: number
  waitTimeSeconds: number
  asymmetricalWithdraw?: Asset
}

export type DepositParams = {
  walletIndex?: number
  asset: Asset
  amount: BaseAmount
  feeOption: FeeOption
  memo: string
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
