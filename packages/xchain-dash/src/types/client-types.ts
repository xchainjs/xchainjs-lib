import { Network } from '@xchainjs/xchain-client'
import { PreparedTx } from '@xchainjs/xchain-utxo'

export type DashPreparedTx = PreparedTx

export type NodeAuth = {
  username: string
  password: string
}
export type NodeUrls = Record<Network, string>
