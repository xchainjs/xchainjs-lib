import { FeeOptionKey, Fees } from '@xchainjs/xchain-client'

export type FeeRate = number
export type FeeRates = Record<FeeOptionKey, FeeRate>

export type FeeData = { rates: FeeRates; fees: Fees }

export type NormalTxParams = { addressTo: string; amount: number; feeRate: number }
export type VaultTxParams = NormalTxParams & { memo: string }
