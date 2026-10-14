import type { Chain } from './chain'

export enum AssetType {
  NATIVE,
  TOKEN,
  SYNTH,
  TRADE,
  SECURED,
}

export type AnyAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType
}

export type Asset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.NATIVE
}

/** Token assets such as ERC20 and BEP20. */
export type TokenAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.TOKEN
}

/** Synthetic assets on Thorchain or Mayachain. */
export type SynthAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.SYNTH
}

/** Trade assets on Thorchain or Mayachain. */
export type TradeAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.TRADE
}

/** Secured assets on Thorchain or Mayachain. */
export type SecuredAsset = {
  chain: Chain
  symbol: string
  ticker: string
  type: AssetType.SECURED
}
