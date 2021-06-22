import { Address, FeeOption, Fees, Network } from '@xchainjs/xchain-client'

export type FeeRate = number
export type FeeRates = Record<FeeOption, FeeRate>

export type FeesWithRates = { rates: FeeRates; fees: Fees }

export type NormalTxParams = { addressTo: string; amount: number; feeRate: number }
export type VaultTxParams = NormalTxParams & { memo: string }

export type GetChangeParams = {
  valueOut: number
  sochainUrl: string
  network: Network
  address: Address
}
