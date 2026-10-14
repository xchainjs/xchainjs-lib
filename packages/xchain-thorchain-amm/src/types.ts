import { Balance, FeeOption } from '@xchainjs/xchain-client'
import { LiquidityPool, QuoteTHORName as BaseQuoteTHORName } from '@xchainjs/xchain-thorchain-query'
import {
  Address,
  Asset,
  AssetCryptoAmount,
  BaseAmount,
  Chain,
  CryptoAmount,
  SynthAsset,
  TokenAsset,
  TradeCryptoAmount,
} from '@xchainjs/xchain-util'

export type AllBalances = {
  chain: Chain
  address: string
  balances: Balance[] | string // string is an error
}

export type ExecuteSwap = {
  input: CryptoAmount<Asset | TokenAsset | SynthAsset>
  destinationAsset: Asset | TokenAsset | SynthAsset
  destinationAddress?: Address
  memo: string
  feeOption?: FeeOption
  walletIndex: number
}

export type TxSubmitted = {
  hash: string
  url: string // block explorer
}

export type LiquidityPosition = {
  assetPool: LiquidityPool
  assetAmount: CryptoAmount<Asset | TokenAsset>
  runeAmount: AssetCryptoAmount
  impermanentLossProtection: number
}

export type AddLiquidity = {
  asset: CryptoAmount<Asset | TokenAsset>
  rune: AssetCryptoAmount
  waitTimeSeconds: number
  assetPool: string
}

export type WithdrawLiquidity = {
  assetFee: CryptoAmount<Asset | TokenAsset>
  runeFee: AssetCryptoAmount
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

export type IsApprovedParams = {
  asset: TokenAsset
  amount: CryptoAmount<TokenAsset>
  address: Address
}

export type ApproveParams = {
  asset: TokenAsset
  amount?: CryptoAmount<TokenAsset> // undefined means infinite approval
}

export type QuoteTHORName = BaseQuoteTHORName & {
  allowed: boolean
  errors: string[]
}

export type AddToTradeAccountParams = {
  amount: CryptoAmount<Asset | TokenAsset>
  address: Address
}

export type AddToTradeAccount = {
  toAddress: string
  memo: string
  value: CryptoAmount<Asset | TokenAsset>
  allowed: boolean
  errors: string[]
}

export type WithdrawFromTradeAccountParams = {
  amount: TradeCryptoAmount
  address: Address
}

export type WithdrawFromTradeAccount = {
  memo: string
  value: TradeCryptoAmount
  allowed: boolean
  errors: string[]
}

export type EstimateDepositToRunePool = {
  amount: AssetCryptoAmount
  memo: string
  maturityBlocks: number // blocks after last deposit before withdraw is allowed
  allowed: boolean
  errors: string[]
}

export type DepositToRunePoolParams = {
  amount: AssetCryptoAmount
}

export type EstimateWithdrawFromRunePool = {
  amount: AssetCryptoAmount
  memo: string
  allowed: boolean
  errors: string[]
}

export type WithdrawFromRunePoolParams = {
  withdrawBps: number // 0-10000, where 10000 = 100%
  affiliate?: Address
  feeBps?: number // affiliate bps, 0-1000
}
