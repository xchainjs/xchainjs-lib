import { Address, FeeRate, Network, TxParams } from '@xchainjs/xchain-client'
import { OnlyRequired } from '@xchainjs/xchain-util'

import { UTXO } from './common'

export type LedgerTxInfo = {
  utxos: UTXO[]
  newTxHex: string
}

export type LedgerTxInfoParams = OnlyRequired<TxParams> & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
  haskoinUrl: string
}
