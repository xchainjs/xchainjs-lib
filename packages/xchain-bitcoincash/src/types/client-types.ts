import { FeeOptionKey, Fees } from '@xchainjs/xchain-client'

export type FeeRate = number
export type FeeRates = Record<FeeOptionKey, FeeRate>

export type FeesWithRates = { rates: FeeRates; fees: Fees }

export type NormalTxParams = { addressTo: string; amount: number; feeRate: number }
export type VaultTxParams = NormalTxParams & { memo: string }

// We might extract it into xchain-client later
export type DerivePath = { mainnet: string; testnet: string }

export type ClientUrl = {
  testnet: string
  mainnet: string
}
