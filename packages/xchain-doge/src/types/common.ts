import { Network } from '@xchainjs/xchain-client'

export type UTXO = {
  hash: string
  index: number
  value: number
  txHex?: string
}

export type NodeAuth = {
  username: string
  password: string
}

export type BroadcastTxParams = {
  network: Network
  txHex: string
  nodeUrl: string
  auth?: NodeAuth
}
