import { ReverseTHORNames, THORNameDetails } from '@xchainjs/xchain-mayamidgard'

export type MAYANameDetails = THORNameDetails
export type ReverseMAYANames = ReverseTHORNames
/**
 * Search parameters to search for positions within the THORChain SAVER investment product trunks.
 */
export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
}
