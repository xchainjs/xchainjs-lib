export interface SochainResponse<T> {
  data: T
  status: string
}

export type LtcAddressUTXO = {
  txid: string
  output_no: number
  script_asm: string
  script_hex: string
  value: string
  confirmations: number
  time: number
}

export type LtcGetBalanceDTO = {
  network: string
  address: string
  confirmed_balance: string
  unconfirmed_balance: string
}

export type LtcUnspentTxsDTO = {
  network: string
  address: string
  txs: LtcAddressUTXO[]
}

export type LtcAddressUTXOs = LtcAddressUTXO[]

export interface ChainStatsLtc {
  suggested_transaction_fee_per_byte_sat: number
}
