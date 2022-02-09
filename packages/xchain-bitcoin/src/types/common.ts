import { Network } from '@xchainjs/xchain-client'

export type Witness = {
  value: number
  script: Buffer
}
export type UTXO = {
  hash: string
  index: number
  value: number
  witnessUtxo: Witness
  txHex?: string
}

export type BroadcastTxParams = { network: Network; txHex: string; blockstreamUrl: string }

// We might extract it into xchain-client later
export type DerivePath = Record<Network, string>
