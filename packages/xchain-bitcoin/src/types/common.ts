export type Witness = {
  value: number
  script: Buffer
}
export type UTXO = {
  hash: string
  index: number
  witnessUtxo: Witness
  txHex: string
}

export type UTXOs = UTXO[]

export type BroadcastTxParams = { txHex: string; nodeUrl: string; nodeApiKey: string }

// We might extract it into xchain-client later
export type DerivePath = { mainnet: string; testnet: string }
