import { Network } from '../client'

export type Witness = {
  value: number
  script: Buffer
}
export type UTXO = {
  hash: string
  index: number
  witnessUtxo: Witness
}

export type UTXOs = UTXO[]

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

// We might extract it into xchain-client later
export type DerivePath = { mainnet: string; testnet: string }
