import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import { Msg } from 'cosmos-client'
import { Asset, assetFromString } from '@thorchain/asgardex-util'
import { AssetAtom, AssetMuon, CosmosChain } from './cosmos/types'

/**
 * Type guard for MsgSend
 */
export const isMsgSend = (v: Msg): v is MsgSend => 
  (v as MsgSend)?.amount !== undefined && (v as MsgSend)?.from_address !== undefined && (v as MsgSend)?.to_address !== undefined

/**
 * Type guard for MsgMultiSend
 */
export const isMsgMultiSend = (v: Msg): v is MsgMultiSend => 
  (v as MsgMultiSend)?.inputs !== undefined && (v as MsgMultiSend)?.outputs !== undefined

/**
 * Get denom from Asset
 */
export const getDenom = (v: Asset): string => {
  if (v === AssetAtom) return 'uatom'
  if (v === AssetMuon) return 'umuon'
  return v.symbol
}

/**
 * Get Asset from denom
 */
export const getAsset = (v: string): Asset | null => {
  if (v === 'uatom') return AssetAtom
  if (v === 'umuon') return AssetMuon
  return assetFromString(`${CosmosChain}.${v}`)
}
