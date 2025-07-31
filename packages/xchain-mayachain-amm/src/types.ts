import { QuoteMAYAName as BaseQuoteMAYAName } from '@xchainjs/xchain-mayachain-query'
import { Address, Asset, CryptoAmount, TokenAsset, TokenCryptoAmount, TradeAsset, TradeCryptoAmount } from '@xchainjs/xchain-util'
// Object representing a submitted transaction
export type TxSubmitted = {
  hash: string // The transaction hash
  url: string // The URL of the transaction
}

// Object representing parameters for approving a transaction
export type ApproveParams = {
  asset: TokenAsset // The asset to approve
  amount?: TokenCryptoAmount // The amount to approve, or undefined for an infinite approval
}

// Object representing parameters for checking if a transaction is approved
export type IsApprovedParams = {
  asset: TokenAsset // The asset to check approval for
  amount: TokenCryptoAmount // The amount of the asset to be spent
  address: Address // The address to check approval for
}

/**
 * MAYAName quote parameters
 */
export type QuoteMAYAName = BaseQuoteMAYAName & {
  /**
   * If the action can be or not can be done
   */
  allowed: boolean
  /**
   * If any, list of errors with the reason the operation is not allowed
   */
  errors: string[]
}

/**
 * Add to trade account params
 */
export type AddToTradeAccountParams = {
  /**
   * Amount to add to the account
   */
  amount: CryptoAmount<Asset | TokenAsset>
  /**
   * Maya address to add the trade asset
   */
  address: Address
}

/**
 * Estimation to add amount to trade account
 */
export type AddToTradeAccount = {
  /**
   * Address to send transaction
   */
  toAddress: string
  /**
   * Memo to add to the transaction to add the trade amount
   */
  memo: string
  /**
   * Asset amount to send in the transaction
   */
  value: CryptoAmount<Asset | TokenAsset | TradeAsset>
  /**
   * If the action can be or not can be done
   */
  allowed: boolean
  /**
   * If any, list of errors with the reason the operation is not allowed
   */
  errors: string[]
}

/**
 * Withdraw from trade account params
 */
export type WithdrawFromTradeAccountParams = {
  /**
   * Amount to withdraw from the account
   */
  amount: TradeCryptoAmount
  /**
   * Address to send the withdraw
   */
  address: Address
}

/**
 * Estimation to withdraw amount from trade account
 */
export type WithdrawFromTradeAccount = {
  /**
   * Memo to add to the transaction to add the trade amount
   */
  memo: string
  /**
   * Asset amount to send in the transaction
   */
  value: CryptoAmount<Asset | TokenAsset | TradeAsset>
  /**
   * If the action can be or not can be done
   */
  allowed: boolean
  /**
   * If any, list of errors with the reason the operation is not allowed
   */
  errors: string[]
}
