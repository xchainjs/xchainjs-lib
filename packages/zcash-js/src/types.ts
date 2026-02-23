export type Config = {
  server: {
    host: string
    user: string
    password: string
  }
  mainnet: boolean
}

export type UTXO = {
  address: string
  txid: string
  outputIndex: number
  satoshis: number
}

export type OutputPKH = {
  type: 'pkh'
  address: string
  amount: number
}

export type OutputMemo = {
  type: 'op_return'
  memo: string
}

export type Output = OutputPKH | OutputMemo

export type Tx = {
  height: number
  inputs: UTXO[]
  outputs: Output[]
  fee: number
}
