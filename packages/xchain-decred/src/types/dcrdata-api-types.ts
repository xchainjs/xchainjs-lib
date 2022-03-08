import { Network, TxHash } from '@xchainjs/xchain-client'

export type TxUnspent = {
  address: string
  txid: string
  vout: number
  ts: number
  scriptPubKey: string
  height: number
  amount: number
  satoshis: number
  confirmations: number
}

export type DcrUTXO = {
  address: string
  txid: TxHash
  vout: number
  ts: number
  scriptPubKey: string
  height: number
  amount: number
  satoshis: number
  confirmations: number
}

export type AddressParams = {
  dcrdataUrl: string
  network: Network
  address: string
  startingFromTxId?: string
}

export type TxHashParams = {
  dcrdataUrl: string
  network: Network
  hash: TxHash
}

export type TxBroadcastParams = {
  dcrdataUrl: string
  network: Network
  txHex: string
}

export type DcrTxFrom = {
  txid: string
  sequence: number
  n: number
  addr: string
  value: number
  valueSat: number
}

export type DcrTxTo = {
  value: number
  n: number
  scriptPubKey: {
    addresses: string[]
  }
}

export interface DcrdataResponse<T> {
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

export type DcrAddressUTXO = {
  txid: string
  output_no: number
  script_asm: string
  script_hex: string
  value: string
  confirmations: number
  time: number
}

export type DcrAddressTxDTO = {
  txid: string
  block_no: number
  confirmations: number
  time: number
  req_sigs: number
  script_asm: string
  script_hex: string
}

export type DcrAddressDTO = {
  network: string
  address: string
  balance: string
  received_value: string
  pending_value: string
  total_txs: number
  txs: DcrAddressTxDTO[]
}

export type DcrGetBalanceDTO = {
  network: string
  address: string
  confirmed_balance: string
  unconfirmed_balance: string
}

export type DcrUnspentTxsDTO = {
  network: string
  address: string
  txs: DcrAddressUTXO[]
}

export type DcrBroadcastTransfer = {
  network: string
  txid: string
}

export type TxConfirmedStatus = {
  network: string
  txid: string
  confirmations: number
  is_confirmed: boolean
}

export type ScanUTXOParam = {
  dcrdataUrl: string
  network: Network
  address: string
  confirmedOnly?: boolean
}
