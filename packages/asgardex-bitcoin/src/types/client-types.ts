export interface FeeOption {
  feeRate: number // sats/byte
  feeTotal: number // sats
}

export interface FeeOptions {
  [index: string]: FeeOption
}
