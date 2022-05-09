/**
 * Minimum transaction fee
 * 100000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/dogecoin/dogecoin/blob/master/src/validation.h#L58
 */
export const MIN_TX_FEE = 100000
export const DOGE_DECIMAL = 8
export const LOWER_FEE_BOUND = 40_000
export const UPPER_FEE_BOUND = 20_000_000