import { PreparedTx } from '@xchainjs/xchain-client'
import { UTXO } from '@xchainjs/xchain-utxo'

export type DashPreparedTx = {
  utxos: UTXO[]
} & PreparedTx
