import { Network } from '@xchainjs/xchain-client'
import { PreparedTx } from '@xchainjs/xchain-utxo'

export type DashPreparedTx = PreparedTx

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
