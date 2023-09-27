import { Asset, baseAmount } from '@xchainjs/xchain-util'

export const KUJI_DECIMAL = 6

export const DEFAULT_GAS_LIMIT = '200000'

export const DEFAULT_FEE = baseAmount(5000, KUJI_DECIMAL)

export const KUJIChain = 'KUJI' as const

export const AssetKUJI: Asset = { chain: KUJIChain, symbol: 'KUJI', ticker: 'KUJI', synth: false }
