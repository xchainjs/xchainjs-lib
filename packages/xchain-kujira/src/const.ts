import { Asset, baseAmount } from '@xchainjs/xchain-util'

export const KUJI_DECIMAL = 6

export const DEFAULT_GAS_LIMIT = '200000'

export const DEFAULT_FEE = baseAmount(5000, KUJI_DECIMAL)

export const KUJIChain = 'KUJI' as const

export const AssetKUJI: Asset = { chain: KUJIChain, symbol: 'KUJI', ticker: 'KUJI', synth: false }

/**
 * USK denom
 */
export const USK_ASSET_DENOM = 'factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk' as const

/**
 * USK Asset
 */
export const AssetUSK: Asset = { chain: KUJIChain, symbol: 'USK', ticker: 'USK', synth: false }

/**
 * USK asset number of decimals
 */
export const USK_DECIMAL = 6

export const MSG_SEND_TYPE_URL = '/cosmos.bank.v1beta1.MsgSend' as const
