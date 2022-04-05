import { Asset, Chain } from '@xchainjs/xchain-util'

export const TERRA_DECIMAL = 6 // 10^6

export const AssetLUNA: Asset = { chain: Chain.Terra, symbol: 'LUNA', ticker: 'LUNA', synth: false }
export const AssetLUNASynth: Asset = { ...AssetLUNA, synth: true }
export const AssetSDT: Asset = { chain: Chain.Terra, symbol: 'SDT', ticker: 'SDT', synth: false }
export const AssetUST: Asset = { chain: Chain.Terra, symbol: 'UST', ticker: 'UST', synth: false }
export const AssetUSTSynth: Asset = { ...AssetUST, synth: true }
export const AssetKRT: Asset = { chain: Chain.Terra, symbol: 'KRT', ticker: 'KRT', synth: false }
export const AssetMNT: Asset = { chain: Chain.Terra, symbol: 'MNT', ticker: 'MNT', synth: false }
export const AssetEUT: Asset = { chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: false }
export const AssetCNT: Asset = { chain: Chain.Terra, symbol: 'CNT', ticker: 'CNT', synth: false }
export const AssetJPT: Asset = { chain: Chain.Terra, symbol: 'JPT', ticker: 'JPT', synth: false }
export const AssetGBT: Asset = { chain: Chain.Terra, symbol: 'GBT', ticker: 'GBT', synth: false }
export const AssetINT: Asset = { chain: Chain.Terra, symbol: 'INT', ticker: 'INT', synth: false }
export const AssetCAT: Asset = { chain: Chain.Terra, symbol: 'CAT', ticker: 'CAT', synth: false }
export const AssetCHT: Asset = { chain: Chain.Terra, symbol: 'CHT', ticker: 'CHT', synth: false }
export const AssetAUT: Asset = { chain: Chain.Terra, symbol: 'AUT', ticker: 'AUT', synth: false }
export const AssetSGT: Asset = { chain: Chain.Terra, symbol: 'SGT', ticker: 'SGT', synth: false }
export const AssetTBT: Asset = { chain: Chain.Terra, symbol: 'TBT', ticker: 'TBT', synth: false }
export const AssetSET: Asset = { chain: Chain.Terra, symbol: 'SET', ticker: 'SET', synth: false }
export const AssetNOT: Asset = { chain: Chain.Terra, symbol: 'NOT', ticker: 'NOT', synth: false }
export const AssetDKT: Asset = { chain: Chain.Terra, symbol: 'DKT', ticker: 'DKT', synth: false }
export const AssetIDT: Asset = { chain: Chain.Terra, symbol: 'IDT', ticker: 'IDT', synth: false }
export const AssetPHT: Asset = { chain: Chain.Terra, symbol: 'PHT', ticker: 'PHT', synth: false }
export const AssetHKT: Asset = { chain: Chain.Terra, symbol: 'HKT', ticker: 'HKT', synth: false }
export const AssetMYT: Asset = { chain: Chain.Terra, symbol: 'MYT', ticker: 'MYT', synth: false }
export const AssetTWT: Asset = { chain: Chain.Terra, symbol: 'TWT', ticker: 'TWT', synth: false }
