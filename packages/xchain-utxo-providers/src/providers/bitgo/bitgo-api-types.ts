export type GetFeeEstimateRequest = {
  numBlocks?: number // target number of blocks
}

export type GetFeeEstimateResponse = {
  feePerKb: number // Fee per kilobyte for a transaction to be confirmed across two or more blocks.
  cpfpFeePerKb?: number // Child pays for parent (CPFP) fee per kilobyte where the fee includes the fees for all unconfirmed transactions dependent on this transaction.
  numBlocks: string // The target block confirmation.
  confidence?: number // (BTC only) Confidence, as a percentage, in the accuracy of the fee estimate
  multiplier?: number // (BTC only) Three decimal value used to estimate fees when the mempool is congested; otherwise defaults to 1
  feeByBlockTarget?: Record<string, number> // (BTC only) Fee estimates are stored as a key-value pair where the key is the block target (between 1 and 1000) and the value is the corresponding fee estimate (in baseunits per kilobyte)
}
