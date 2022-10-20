import { FeeOption } from '@xchainjs/xchain-client'
import { CryptoAmount, LiquidityPool } from '@xchainjs/xchain-thorchain-query'
import { Address, Asset, BaseAmount } from '@xchainjs/xchain-util'

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

export type LiquidityPosition = {
  assetPool: LiquidityPool
  assetAmount: CryptoAmount
  runeAmount: CryptoAmount
  impermanentLossProtection: number
}

export type AddLiquidity = {
  asset: CryptoAmount
  rune: CryptoAmount
  waitTimeSeconds: number
  assetPool: string
}
export type WithdrawLiquidity = {
  assetFee: CryptoAmount
  runeFee: CryptoAmount
  waitTimeSeconds: number
  percentage: number
  assetPool: string
  assetAddress?: string
  runeAddress?: string
}

export type DepositParams = {
  walletIndex?: number
  asset: Asset
  amount: BaseAmount
  feeOption: FeeOption
  memo: string
}
