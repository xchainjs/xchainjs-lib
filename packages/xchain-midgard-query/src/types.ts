import { GetActions200Response } from '@xchainjs/xchain-midgard'
import { Address, Asset, CryptoAmount, SynthAsset, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset | SynthAsset

/**
 * Search parameters to search for positions within the THORChain SAVER investment product trunks.
 */
export type getSaver = {
  asset: Asset | TokenAsset // The asset associated with the saver position.
  address: Address // The address associated with the saver position.
  height?: number // Optional parameter representing the height at which the search is conducted.
}

/**
 * Represents the position of a saver within the THORChain SAVER investment product trunks.
 */
export type SaversPosition = {
  depositValue: CryptoAmount<Asset | TokenAsset> // The value of the deposit made by the saver.
  redeemableValue: CryptoAmount<Asset | TokenAsset> // The value that the saver can redeem.
  lastAddHeight: number // The height at which the last addition was made to the saver position.
  percentageGrowth: number // The percentage growth of the saver's position.
  ageInYears: number // The age of the saver's position in years.
  ageInDays: number // The age of the saver's position in days.
  asset: Asset | TokenAsset // The asset associated with the saver position.
  errors: string[] // Any errors encountered during processing.
}

/**
 * Configuration options for the Midgard API.
 */
export type MidgardConfig = {
  apiRetries: number // The number of retries for API requests.
  midgardBaseUrls: string[] // The base URLs of the Midgard API endpoints.
}

/**
 * Action types
 */
export type ActionType = 'swap' | 'addLiquidity' | 'withdraw' | 'donate' | 'refund' | 'switch'

/**
 * Action Tx type
 */
export type ActionTxType =
  | 'unknown'
  | 'add'
  | 'withdraw'
  | 'unknown'
  | 'add'
  | 'withdraw'
  | 'swap'
  | 'limitOrder'
  | 'outbound'
  | 'donate'
  | 'bond'
  | 'unbond'
  | 'leave'
  | 'yggdrasilFund'
  | 'yggdrasilReturn'
  | 'reserve'
  | 'refund'
  | 'migrate'
  | 'ragnarok'
  | 'switch'
  | 'noOp'
  | 'consolidate'
  | 'thorname'
  | 'loanOpen'
  | 'loanRepayment'

/**
 * Get action params
 */
export type GetActionsParams = Partial<{
  address: string
  txid: string
  asset: string
  type: ActionType
  txType: ActionTxType
  affiliate: string
  limit: number
  offset: number
  nextPageToken: number
  timestamp: number
  height: number
  prevPageToken: number
  fromTimestamp: number
  fromHeight: number
}>

/**
 * Action history
 */
export type ActionHistory = GetActions200Response
