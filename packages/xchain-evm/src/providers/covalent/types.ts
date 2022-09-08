import { Address } from '@xchainjs/xchain-util'

export type GetBalanceResponse = {
  data: {
    items: [
      {
        contract_decimals: number
        contract_name: string
        contract_ticker_symbol: string
        contract_address: string
        // supports_erc: ['erc20']
        // logo_url: 'https://logos.covalenthq.com/tokens/43114/0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7.png'
        // last_transferred_at: '2022-06-14T09:00:38Z'
        // type: 'cryptocurrency'
        balance: string
        // balance_24h: null
        // quote_rate: 1.0006042
        // quote_rate_24h: 0.963379
        // quote: 2.70515808e8
        // quote_24h: null
        // nft_data: null
      },
    ]
  }
}
// asset: Asset;
//     from: TxFrom[];
//     to: TxTo[];
//     date: Date;
//     type: TxType;
//     hash: string;
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
