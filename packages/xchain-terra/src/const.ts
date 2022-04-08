import { Asset, Chain } from '@xchainjs/xchain-util'

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
