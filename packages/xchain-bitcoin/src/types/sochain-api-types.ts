export interface SochainResponse<T> {
  data: T
  status: string
}

export interface TxIO {
  input_no: number
  value: string
  address: string
  type: string
  script: string
}

export interface Transaction {
  network: string
  txid: string
  blockhash: string
  confirmations: number
  time: number

  inputs: TxIO[]
  outputs: TxIO[]
}

export type BtcAddressUTXO = {
  txid: string
  output_no: number
  script_asm: string
  script_hex: string
  value: string
  confirmations: number
  time: number
}

export type BtcAddressTxDTO = {
  txid: string
  block_no: number
  confirmations: number
  time: number
  req_sigs: number
  script_asm: string
  script_hex: string
}

export type BtcAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
  txs: BtcAddressTxDTO[]
}

export type BtcGetBalanceDTO = {
  network: string
  address: string
  confirmed_balance: string
  unconfirmed_balance: string
}

export type BtcUnspentTxsDTO = {
  network: string
  address: string
  txs: BtcAddressUTXO[]
}

export type BtcAddressUTXOs = BtcAddressUTXO[]

export type BtcBroadcastTransfer = {
  network: string
  txid: string
}
