import { Address, Balance, FeeOptionKey, Fees, Network, TxHash } from '@xchainjs/xchain-client'

export type FeeRate = number
export type FeeRates = Record<FeeOptionKey, FeeRate>

export type FeesWithRates = { rates: FeeRates; fees: Fees }

export type NormalTxParams = { addressTo: Address; amount: number; feeRate: FeeRate }
export type VaultTxParams = NormalTxParams & { memo: string }

// We might extract it into xchain-client later
export type DerivePath = Record<Network, string>
export type ClientUrl = Record<Network, string>

export type Witness = {
  value: number
  script: Buffer
}

export type UTXO = {
  hash: TxHash
  index: number
  value: number
  witnessUtxo: Witness
  address: Address
  txHex: string
}

export type GetChangeParams = {
  valueOut: number
  bchBalance: Balance
}
