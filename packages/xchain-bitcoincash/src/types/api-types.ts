export type AddressBalance = {
  received: number
  utxo: number
  address: string
  txs: number
  unconfirmed: number
  confirmed: number
}

export type TransactionInput = {
  pkscript: string
  value: number
  address: string | null
  witness: string[]
  sequence: number
  output: number
  sigscript: string
  coinbase: boolean
  txid: string
}

export type TransactionOutput = {
  spent: boolean
  pkscript: string
  value: number
  address: string | null
  spender: {
    input: number
    txid: string
  } | null
}

export type Transaction = {
  time: number
  size: number
  inputs: TransactionInput[]
  weight: number
  fee: number
  locktime: number
  block: {
    height: number
    position: number
  }
  outputs: TransactionOutput[]
  version: number
  deleted: boolean
  rbf: boolean
  txid: string
}
