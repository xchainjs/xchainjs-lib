import type { Chain } from './chain'

/**
 * Asset type
 */
export enum AssetType {
  NATIVE,
  TOKEN,
  SYNTH,
  TRADE,
  SECURED,
}

/**
 * Any Asset XChainJS can work with
 */
export type AnyAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType
}

/**
 * Asset type for native assets
 */
export type Asset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.NATIVE
}

/**
 * Asset type for token assets. For example ERC20, BEP20
 */
export type TokenAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.TOKEN
}

/**
 * Asset type for synthetic assets which lives in networks like Thorchain or Mayachain
 */
export type SynthAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.SYNTH
}

/**
 * Asset type for trade assets which lives in networks like Thorchain or Mayachain
 */
export type TradeAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.TRADE
}

/**
 * Asset type for secured assets which lives in networks like Thorchain or Mayachain
 */
export type SecuredAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.SECURED
}
