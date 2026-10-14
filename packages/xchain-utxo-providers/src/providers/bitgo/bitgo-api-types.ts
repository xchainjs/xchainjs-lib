export type GetFeeEstimateRequest = {
  numBlocks?: number
}

export type GetFeeEstimateResponse = {
  feePerKb: number // per kilobyte, for confirmation in two or more blocks
  cpfpFeePerKb?: number // includes fees of unconfirmed ancestors (child-pays-for-parent)
  numBlocks: string
  confidence?: number // BTC only, percent
  multiplier?: number // BTC only; three decimals, defaults to 1 when the mempool is not congested
  feeByBlockTarget?: Record<string, number> // BTC only; block target 1-1000 -> base units per kilobyte
}
