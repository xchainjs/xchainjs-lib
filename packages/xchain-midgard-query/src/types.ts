import { Address, Asset, CryptoAmount } from '@xchainjs/xchain-util'

/**
 * Search parameters to search for positions within the THORChain SAVER investment product trunks.
 */
export type getSaver = {
  asset: Asset // The asset associated with the saver position.
  address: Address // The address associated with the saver position.
  height?: number // Optional parameter representing the height at which the search is conducted.
}

/**
 * Represents the position of a saver within the THORChain SAVER investment product trunks.
 */
export type SaversPosition = {
  depositValue: CryptoAmount // The value of the deposit made by the saver.
  redeemableValue: CryptoAmount // The value that the saver can redeem.
  lastAddHeight: number // The height at which the last addition was made to the saver position.
  percentageGrowth: number // The percentage growth of the saver's position.
  ageInYears: number // The age of the saver's position in years.
  ageInDays: number // The age of the saver's position in days.
  asset: Asset // The asset associated with the saver position.
  errors: string[] // Any errors encountered during processing.
}

/**
 * Configuration options for the Midgard API.
 */
export type MidgardConfig = {
  apiRetries: number // The number of retries for API requests.
  midgardBaseUrls: string[] // The base URLs of the Midgard API endpoints.
}
