import { Asset, baseAmount } from '@xchainjs/xchain-util'
/**
 * Decimal places for KUJI asset.
 */
export const KUJI_DECIMAL = 6

/**
 * Default gas limit for transactions.
 */
export const DEFAULT_GAS_LIMIT = '200000'

/**
 * Default fee for transactions, represented as a base amount.
 */
export const DEFAULT_FEE = baseAmount(5000, KUJI_DECIMAL)

/**
 * Chain identifier for KUJI.
 */
export const KUJIChain = 'KUJI' as const

/**
 * Asset information for KUJI.
 */
export const AssetKUJI: Asset = { chain: KUJIChain, symbol: 'KUJI', ticker: 'KUJI', synth: false, trade: false }

/**
 * Denomination for USK asset.
 */
export const USK_ASSET_DENOM = 'factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk' as const

/**
 * Asset information for USK.
 */
export const AssetUSK: Asset = { chain: KUJIChain, symbol: 'USK', ticker: 'USK', synth: false, trade: false }

/**
 * Decimal places for USK asset.
 */
export const USK_DECIMAL = 6

/**
 * Type URL for sending a message.
 */
export const MSG_SEND_TYPE_URL = '/cosmos.bank.v1beta1.MsgSend' as const
