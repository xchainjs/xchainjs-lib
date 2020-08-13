export interface FeeOption {
  feeRate: number // sats/byte
  estimatedFee: number // sats
  estimatedTxTime: number // seconds
}

export interface FeeOptions {
  [index: string]: FeeOption
}
