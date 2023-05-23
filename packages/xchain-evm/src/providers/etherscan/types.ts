import { Address } from '@xchainjs/xchain-util'

export type ERC20Tx = {
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
export type GasAssetTx = {
  timeStamp: string
  hash: string
  from: string
  contractAddress: string
  to: string
  value: string
}
export type GetERC20TxsResponse = {
  status: string
  message: string
  result: ERC20Tx[]
}
export type GetGasAssetTxsResponse = {
  status: string
  message: string
  result: GasAssetTx[]
}
// const x = {
//   status: '1',
//   message: 'OK',
//   result: [
//     {
//       blockNumber: '11130756',
//       timeStamp: '1656627389',
//       hash: '0x92f08270f080983c26ec3ba983d4827f1f8c33624513bb234e1e5aeffb7bdb19',
//       nonce: '0',
//       blockHash: '0xd647b09b93c4c4985f819737c20933703dbf6eaead5a2e3890303fed0046a2b6',
//       from: '0x55b3f7f4d7c06670d25cee97ecb00b65a44ca112',
//       contractAddress: '0x224695ba2a98e4a096a519b503336e06d9116e48',
//       to: '0xf32da51880374201852057009c4c4d1e75949e09',
//       value: '12208046749012041430',
//       tokenName: 'The Crypt',
//       tokenSymbol: 'RIP',
//       tokenDecimal: '18',
//       transactionIndex: '0',
//       gas: '167467',
//       gasPrice: '26800000000',
//       gasUsed: '149343',
//       cumulativeGasUsed: '149343',
//       input: 'deprecated',
//       confirmations: '200936',
//     },
//   ],
// }

export type LogEventParam = {
  name: string //to or from or value
  type: string //address or contract
  value: string
}

export type LogEvent = {
  sender_contract_decimals: number
  sender_contract_ticker_symbol: string | null | undefined
  sender_address: string | null | undefined //ERC-20 contract address
  decoded: DecodedEvent | null | undefined
}
export type DecodedEvent = {
  name: string //Transfer or Approval etc
  params: LogEventParam[] | null | undefined
}
export type GetTransactionsItem = {
  tx_hash: string
  block_signed_at: string
  from_address: string
  to_address: string
  value: string
  log_events: LogEvent[]
}
export type GetTransactionsResponse = {
  data: {
    address: string
    items: GetTransactionsItem[]
    pagination: {
      has_more: boolean
      page_number: number
      page_size: number
      total_count: number | null
    }
  }
}
export type GetTransactionResponse = {
  data: {
    items: GetTransactionsItem[]
  }
}
export type getTxsParams = {
  address: Address
  offset: number
  limit: number
  assetAddress: string | undefined
}
