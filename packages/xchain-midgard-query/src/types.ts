import { Address, Asset, CryptoAmount } from '@xchainjs/xchain-util'

/**
 * Search parameters to search for positions within the THORChain SAVER investment product trunks.
 */
export type getSaver = {
  asset: Asset
  address: Address
  height?: number
}

export type SaversPosition = {
  depositValue: CryptoAmount
  redeemableValue: CryptoAmount
  lastAddHeight: number
  percentageGrowth: number
  ageInYears: number
  ageInDays: number
  asset: Asset
  errors: string[]
}

export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
}
