export type AddressBalance = {
  confirmed: number
  unconfirmed: number
  balance: number
}

export type TransactionData = {
  _id: string
  txid: string
  network: string
  chain: string
  blockHeight: number
  blockHash: string
  blockTime: string
  blockTimeNormalized: string
  coinbase: boolean
  locktime: number
  inputCount: number
  outputCount: number
  size: number
  fee: number
  value: number
  confirmations: number
}

export type TranactionInputOutput = {
  _id: string
  chain: string
  network: string
  coinbase: boolean
  mintIndex: number
  spentTxid: string
  mintTxid: string
  mintHeight: number
  spentHeight: number
  address: string
  script: string
  value: number
  confirmations: number
  sequenceNumber?: number
}

export type TransactionCoins = {
  inputs: TranactionInputOutput[]
  outputs: TranactionInputOutput[]
}
