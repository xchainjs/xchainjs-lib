export type FeeOption = {
  feeRate: number // sats/byte
  feeTotal: number // sats
}

export type FeeOptionsKey = 'fast' | 'regular' | 'slow'

export type FeeOptions = Record<FeeOptionsKey, FeeOption>

export type NormalTxParams = { addressTo: string; amount: number; feeRate: number }
export type VaultTxParams = NormalTxParams & { memo: string }
