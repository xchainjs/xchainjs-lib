import { FeeRate, Network, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

import { UTXO } from './common'

export type LedgerTxInfo = {
  utxos: UTXO[]
  newTxHex: string
}

export type LedgerTxInfoParams = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
  nodeApiKey: string
}
