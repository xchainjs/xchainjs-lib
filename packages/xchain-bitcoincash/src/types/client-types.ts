import { FeeOption, Fees, Network, TxHash } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { Balance, PreparedTx, UTXO as BaseUTXO } from '@xchainjs/xchain-utxo'

export type FeeRate = number
export type FeeRates = Record<FeeOption, FeeRate>

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

export type BchPreparedTx = {
  utxos: BaseUTXO[]
  inputs: BaseUTXO[]
} & PreparedTx
