import { Balance, FeeOption } from '@xchainjs/xchain-client'
import { LiquidityPool } from '@xchainjs/xchain-thorchain-query'
import { Address, Asset, BaseAmount, Chain, CryptoAmount } from '@xchainjs/xchain-util'

export type AllBalances = {
  chain: Chain
  address: string
  balances: Balance[] | string
}

export type ExecuteSwap = {
  input: CryptoAmount
  destinationAsset: Asset
  destinationAddress?: Address
  memo: string
  feeOption?: FeeOption
  walletIndex: number
}

export type TxSubmitted = {
  hash: string
  url: string
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

export type LoanOpenParams = {
  memo: string
  amount: CryptoAmount
  toAddress: Address
}

export type LoanCloseParams = {
  memo: string
  amount: CryptoAmount
  toAddress: Address
}

export type RegisterThornameParams = {
  thorname: string
  owner?: string
  chain?: string
  chainAddress?: string
  preferredAsset?: Asset
  expirity?: Date
}

export type UpdateThornameParams = {
  thorname: string
  owner?: string
  chain?: string
  chainAddress?: string
  preferredAsset?: Asset
  expirity?: Date
}
