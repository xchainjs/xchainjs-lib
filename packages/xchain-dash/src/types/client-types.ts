import { Network, PreparedTx } from '@xchainjs/xchain-client'
import { UTXO } from '@xchainjs/xchain-utxo'

export type DashPreparedTx = {
  utxos: UTXO[]
} & PreparedTx

/**
 * Node authentication object containing username and password.
 */
export type NodeAuth = {
  username: string
  password: string
}
/**
 * Record object containing URLs for different networks.
 */
export type NodeUrls = Record<Network, string>
