import { Address, Network, TxParams } from '@xchainjs/xchain-client'
import { FeeRate } from './client-types'
import { UTXOs } from './common'

export type LedgerTxInfo = {
  utxos: UTXOs
  newTxHex: string
}

type OnlyRequiredKeys<T, U = keyof T> = U extends keyof T ? (undefined extends T[U] ? never : U) : never
type OnlyRequired<T> = Pick<T, OnlyRequiredKeys<T>>

export type LedgerTxInfoParams = OnlyRequired<TxParams> & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
}
