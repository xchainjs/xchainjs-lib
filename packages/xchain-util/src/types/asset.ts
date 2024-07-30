import { Chain } from './chain'

/**
 * Asset type
 */
export enum AssetType {
  NATIVE,
  TOKEN,
  SYNTH,
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
