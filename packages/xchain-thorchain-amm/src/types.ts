import { Balance, FeeOption } from '@xchainjs/xchain-client'
import { LiquidityPool } from '@xchainjs/xchain-thorchain-query'
import { Address, Asset, BaseAmount, Chain, CryptoAmount } from '@xchainjs/xchain-util'

/**
 * Represents the balance information for all assets on a particular chain.
 */
export type AllBalances = {
  chain: Chain // The chain associated with the balances
  address: string // The address for which balances are provided
  balances: Balance[] | string // An array of asset balances or a string indicating an error
}

/**
 * Represents the parameters for executing a swap transaction.
 */
export type ExecuteSwap = {
  input: CryptoAmount // The amount to swap
  destinationAsset: Asset // The asset to receive after swapping
  destinationAddress?: Address // The address to receive the swapped asset (optional)
  memo: string // Memo to include with the transaction
  feeOption?: FeeOption // Fee option for the transaction (optional)
  walletIndex: number // Index of the wallet to use for the transaction
}

/**
 * Represents a submitted transaction.
 */
export type TxSubmitted = {
  hash: string // Transaction hash
  url: string // URL of the transaction on the block explorer
}

/**
 * Represents a liquidity position in a liquidity pool.
 */
export type LiquidityPosition = {
  assetPool: LiquidityPool // The liquidity pool in which the position exists
  assetAmount: CryptoAmount // The amount of asset in the position
  runeAmount: CryptoAmount // The amount of RUNE in the position
  impermanentLossProtection: number // The level of impermanent loss protection
}

/**
 * Represents the parameters for adding liquidity to a pool.
 */
export type AddLiquidity = {
  asset: CryptoAmount // The amount of asset to add to the pool
  rune: CryptoAmount // The amount of RUNE to add to the pool
  waitTimeSeconds: number // Estimated wait time for the transaction to be processed
  assetPool: string // The pool's asset address
}

/**
 * Represents the parameters for withdrawing liquidity from a pool.
 */
export type WithdrawLiquidity = {
  assetFee: CryptoAmount // The fee in asset for withdrawing liquidity
  runeFee: CryptoAmount // The fee in RUNE for withdrawing liquidity
  waitTimeSeconds: number // Estimated wait time for the transaction to be processed
  percentage: number // Percentage of liquidity to withdraw
  assetPool: string // The pool's asset address
  assetAddress?: string // The address to receive withdrawn assets (optional)
  runeAddress?: string // The address to receive withdrawn RUNE (optional)
}

/**
 * Represents the parameters for depositing an asset.
 */
export type DepositParams = {
  walletIndex?: number // Index of the wallet to use for the deposit (optional)
  asset: Asset // The asset to deposit
  amount: BaseAmount // The amount to deposit
  feeOption: FeeOption // Fee option for the transaction
  memo: string // Memo to include with the transaction
}

/**
 * Represents the parameters for opening a loan.
 */
export type LoanOpenParams = {
  memo: string // Memo to include with the loan transaction
  amount: CryptoAmount // The amount of asset to loan
  toAddress: Address // The address to receive the loan
}

/**
 * Represents the parameters for closing a loan.
 */
export type LoanCloseParams = {
  memo: string // Memo to include with the loan transaction
  amount: CryptoAmount // The amount of asset to repay
  toAddress: Address // The address to repay the loan
}

/**
 * Represents the parameters for registering a THORName.
 */
export type RegisterThornameParams = {
  thorname: string // The THORName to register
  owner?: string // The owner of the THORName (optional)
  chain?: string // The chain associated with the THORName (optional)
  chainAddress?: string // The address associated with the THORName (optional)
  preferredAsset?: Asset // Preferred asset associated with the THORName (optional)
  expirity?: Date // Expiry date for the THORName (optional)
}

/**
 * Represents the parameters for updating a THORName.
 */
export type UpdateThornameParams = {
  thorname: string // The THORName to update
  owner?: string // The new owner of the THORName (optional)
  chain?: string // The new chain associated with the THORName (optional)
  chainAddress?: string // The new address associated with the THORName (optional)
  preferredAsset?: Asset // New preferred asset associated with the THORName (optional)
  expirity?: Date // New expiry date for the THORName (optional)
}
