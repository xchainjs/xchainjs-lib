import { Asset, assetToString } from '@xchainjs/xchain-util'
import { AssetRune } from './types'

/**
 * Get denom from Asset
 */
export const getDenom = (v: Asset): string => {
  if (assetToString(v) === assetToString(AssetRune)) return 'thor'
  return v.symbol
}

/**
 * Get Asset from denom
 */
export const getAsset = (v: string): Asset | null => {
  if (v === getDenom(AssetRune)) return AssetRune
  return null
}
