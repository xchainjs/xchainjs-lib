import { Asset, Chain, TerraChain } from '@xchainjs/xchain-util'

import { TERRA_NATIVE_DENOMS, TerraNativeDenom } from './types/terra'

export const TERRA_DECIMAL = 6 // 10^6

export const AssetLUNA: Asset = { chain: Chain.Terra, symbol: 'LUNA', ticker: 'LUNA', synth: false }
export const AssetLUNASynth: Asset = { ...AssetLUNA, synth: true }
export const AssetUST: Asset = { chain: Chain.Terra, symbol: 'UST', ticker: 'UST', synth: false }
export const AssetUSTSynth: Asset = { ...AssetUST, synth: true }

/**
 * Default gas adjustment
 *
 * Currently 2.0 (similar to `terra-station`)
 * @see https://github.com/terra-money/station/blob/780cf8f05bc544c846653b5e1c1252ffacb7bb8a/src/config/constants.ts#L29
 */
export const DEFAULT_GAS_ADJUSTMENT = 2

// cached map - will never be exported
let terraNativeAssetsMap: Map<TerraNativeDenom, Asset> | null

/**
 * Returns Map of Terra Native assets
 */
export const getTerraNativeAssetsMap = () => {
  if (terraNativeAssetsMap && terraNativeAssetsMap.size > 0) return terraNativeAssetsMap

  const assets: [TerraNativeDenom, Asset][] = TERRA_NATIVE_DENOMS.map((denom: TerraNativeDenom) => {
    // Transformation of denom -> symbol
    // by removing prefix `u` + replacing last char with `T` + always uppercase
    // Example: `uaud` -> `AUT`)
    const symbol = `${denom.substring(1, 3)}T`.toUpperCase()
    const asset =
      denom === 'uluna'
        ? AssetLUNA
        : denom === 'uusd'
        ? AssetUST
        : { chain: TerraChain, symbol, ticker: symbol, synth: false }
    const tuple: [TerraNativeDenom, Asset] = [denom, asset]
    return tuple
  })

  terraNativeAssetsMap = new Map(assets)

  return terraNativeAssetsMap
}
