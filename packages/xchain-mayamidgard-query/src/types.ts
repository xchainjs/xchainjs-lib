import { ReverseTHORNames, THORNameDetails } from '@xchainjs/xchain-mayamidgard'

/**
 * Type alias for MAYANameDetails, representing details associated with a MAYAName.
 */
export type MAYANameDetails = THORNameDetails

/**
 * Type alias for ReverseMAYANames, representing MAYAName(s) associated with an address.
 */
export type ReverseMAYANames = ReverseTHORNames

/**
 * Configuration object for Midgard API settings.
 * Search parameters to search for positions within the THORChain SAVER investment product trunks.
 */
export type MidgardConfig = {
  apiRetries: number // Number of retries for API requests
  midgardBaseUrls: string[] // Base URLs for Midgard API endpoints
}
