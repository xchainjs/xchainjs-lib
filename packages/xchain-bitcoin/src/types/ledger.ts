import { Address, Network, TxParams, FeeRate } from '@xchainjs/xchain-client'
import { UTXOs } from './common'

export type LedgerTxInfo = {
  utxos: UTXOs
  newTxHex: string
}

export type LedgerTxInfoParams = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
}
