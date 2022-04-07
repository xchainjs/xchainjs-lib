import { Asset, Chain } from '@xchainjs/xchain-util'

export const TERRA_DECIMAL = 6 // 10^6

export const AssetLUNA: Asset = { chain: Chain.Terra, symbol: 'LUNA', ticker: 'LUNA', synth: false }
export const AssetLUNASynth: Asset = { ...AssetLUNA, synth: true }
export const AssetUST: Asset = { chain: Chain.Terra, symbol: 'UST', ticker: 'UST', synth: false }
export const AssetUSTSynth: Asset = { ...AssetUST, synth: true }
