import { Msg } from 'cosmos-client'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { AssetThor } from './thor/types'

/**
 * Type guard for MsgSend
 */
export const isMsgSend = (v: Msg): v is MsgSend =>
  (v as MsgSend)?.amount !== undefined &&
  (v as MsgSend)?.from_address !== undefined &&
  (v as MsgSend)?.to_address !== undefined

/**
 * Type guard for MsgMultiSend
 */
export const isMsgMultiSend = (v: Msg): v is MsgMultiSend =>
  (v as MsgMultiSend)?.inputs !== undefined && (v as MsgMultiSend)?.outputs !== undefined

/**
 * Get denom from Asset
 */
export const getDenom = (v: Asset): string => {
  if (assetToString(v) === assetToString(AssetThor)) return 'thor'
  return v.symbol
}

/**
 * Get Asset from denom
 */
export const getAsset = (v: string): Asset | null => {
  if (v === getDenom(AssetThor)) return AssetThor
  return null
}
