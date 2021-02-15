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

export type BroadcastTxParams = { network: Network; txHex: string; nodeUrl: string }

// We might extract it into xchain-client later
export type DerivePath = { mainnet: string; testnet: string }
