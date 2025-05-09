import { Address } from '@xchainjs/xchain-util'

export type ERC20TxV2 = {
  timeStamp: string
  hash: string
  from: string
  contractAddress: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
}
export type GasAssetTxV2 = {
  timeStamp: string
  hash: string
  from: string
  contractAddress: string
  to: string
  value: string
}
export type GetERC20TxsResponseV2 = {
  status: string
  message: string
  result: ERC20TxV2[]
}
export type GetGasAssetTxsResponseV2 = {
  status: string
  message: string
  result: GasAssetTxV2[]
}

export type LogEventParamV2 = {
  name: string //to or from or value
  type: string //address or contract
  value: string
}

export type LogEventV2 = {
  sender_contract_decimals: number
  sender_contract_ticker_symbol: string | null | undefined
  sender_address: string | null | undefined //ERC-20 contract address
  decoded: DecodedEventV2 | null | undefined
}
export type DecodedEventV2 = {
  name: string //Transfer or Approval etc
  params: LogEventParamV2[] | null | undefined
}
export type GetTransactionsItemV2 = {
  tx_hash: string
  block_signed_at: string
  from_address: string
  to_address: string
  value: string
  log_events: LogEventV2[]
}
export type GetTransactionsResponseV2 = {
  data: {
    address: string
    items: GetTransactionsItemV2[]
    pagination: {
      has_more: boolean
      page_number: number
      page_size: number
      total_count: number | null
    }
  }
}
export type GetTransactionResponseV2 = {
  data: {
    items: GetTransactionsItemV2[]
  }
}
export type getTxsParamsV2 = {
  address: Address
  offset: number
  limit: number
  assetAddress: string | undefined
}
