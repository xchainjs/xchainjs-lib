import { PreparedTx, UTXO } from '@xchainjs/xchain-client'

export type DashPreparedTx = {
  utxos: UTXO[]
} & PreparedTx
