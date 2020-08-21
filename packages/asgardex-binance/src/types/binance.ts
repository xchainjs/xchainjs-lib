/**
 * Type definitions for Binance Chain API
 * @see https://docs.binance.org/api-reference/dex-api/
 *
 */

import { NETWORK_PREFIX_MAPPING } from '@binance-chain/javascript-sdk/lib/client'

/**
 * Address
 */
export type Address = string

/**
 * Token
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#token
 */
export type Token = {
  /**
   * token name, e.g. Binance Chain
   */
  name: string
  /**
   * unique token trade symbol, e.g. BTC-000
   */
  symbol: string
  /**
   * token symbol, e.g. BTC
   */
  original_symbol: string
  /**
   * total token supply in decimal form, e.g. 1.00000000
   */
  total_supply: string
  /**
   * Address which issue the token
   */
  owner: string
}

/**
 * Market
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#market
 */
export type Market = {
  /**
   * symbol of base asset, e.g. BNB
   */
  base_asset_symbol: string
  /**
   * symbol of quote asset, e.g. ABC-5CA
   */
  quote_asset_symbol: string
  /**
   * Price in decimal form, e.g. 1.00000000
   */
  list_price: string
  /**
   * Minimium price change in decimal form, e.g. 0.00000001
   */
  tick_size: string
  /**
   * Minimium trading quantity in decimal form, e.g. 1.00000000
   */
  lot_size: string
}

/**
 * TickerStatistics
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#tickerstatistics
 */
export type TickerStatistics = {
  /**
   * sell price
   */
  askPrice: string
  /**
   * sell quantity
   */
  askQuantity: string
  /**
   * buy price
   */
  bidPrice: string
  /**
   * buy quantity
   */
  bidQuantity: string
  /**
   * time of closing
   */
  closeTime: number
  /**
   * total trade count
   */
  count: number
  /**
   * ID of first trade
   */
  firstId: string
  /**
   * highest price
   */
  highPrice: string
  /**
   * ID of last trade
   */
  lastId: string
  /**
   * last price
   */
  lastPrice: string
  /**
   * last quantity
   */
  lastQuantity: string
  /**
   * lowest price
   */
  lowPrice: string
  /**
   * open price
   */
  openPrice: string
  /**
   * open time
   */
  openTime: number
  /**
   * last close price
   */
  prevClosePrice: string
  /**
   * change of price
   */
  priceChange: string
  /**
   * change of price in percentage
   */
  priceChangePercent: string
  /**
   * trading volume in quote asset
   */
  quoteVolume: string
  /**
   * trading symbol
   */
  symbol: string
  /**
   * trading volume
   */
  volume: string
  /**
   * weighted average price
   */
  weightedAvgPrice: string
}

/**
 * Account
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#account
 */
export type Account = {
  /**
   * Account number
   */
  account_number: number
  /**
   * Address of the account
   */
  address: Address
  /**
   * List of balances
   */
  balances: [Balance]
  /**
   * Public key bytes
   */
  public_key: [number]
  /**
   * sequence is for preventing replay attack
   */
  sequence: number
}

/**
 * TxPage
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#txpage
 */
export type TxPage = {
  /**
   * total sum of transactions
   */
  total: number
  /**
   * List of transactions
   */
  tx: Txs
}

export type FeeType =
  | 'submit_proposal'
  | 'deposit'
  | 'vote'
  | 'create_validator'
  | 'remove_validator'
  | 'dexList'
  | 'orderNew'
  | 'orderCancel'
  | 'issueMsg'
  | 'mintMsg'
  | 'tokensBurn'
  | 'tokensFreeze'
  | 'send'
  | 'timeLock'
  | 'timeUnlock'
  | 'timeRelock'
  | 'setAccountFlags'
  | 'HTLT'
  | 'depositHTLT'
  | 'claimHTLT'
  | 'refundHTLT'

export type Fee = {
  msg_type: FeeType
  fee: number
  fee_for: number
}

export type TransferFee = {
  fixed_fee_params: Fee
  multi_transfer_fee: number
  lower_limit_as_multi: number
}

export type DexFeeName =
  | 'ExpireFee'
  | 'ExpireFeeNative'
  | 'CancelFee'
  | 'CancelFeeNative'
  | 'FeeRate'
  | 'FeeRateNative'
  | 'IOCExpireFee'
  | 'IOCExpireFeeNative'

export type DexFee = {
  fee_name: DexFeeName
  fee_value: number
}

export type DexFees = {
  dex_fee_fields: DexFee[]
}

export type Fees = Array<Fee | TransferFee | DexFees>

/**
 * Tx
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#tx
 */
export type Tx = {
  /**
   * block height
   */
  blockHeight: number
  /**
   * transaction result code
   */
  code: number
  /**
   * _no offical description_
   */
  confirmBlocks: number
  /**
   * _no offical description_
   */
  data: string | null
  /**
   * From address
   */
  fromAddr: Address
  /**
   * Order ID
   */
  orderId: string | null
  /**
   * Time of transaction
   */
  timeStamp: string
  /**
   * To address
   */
  toAddr: Address
  /**
   * _no offical description_
   */
  txAge: number
  /**
   * _no offical description_
   */
  txAsset: string
  /**
   * _no offical description_
   */
  txFee: string
  /**
   * hash of transaction
   */
  txHash: string
  /**
   * Type of transaction
   */
  txType: TxType
  /**
   * memo
   */
  memo: string
  /**
   * Value of transaction
   */
  value: string
  /**
   * _no offical description_
   */
  source: number
  /**
   * _no offical description_
   */
  sequence: number
  /**
   * Optional. Available when the transaction type is one of HTL_TRANSFER, CLAIM_HTL, REFUND_HTL, DEPOSIT_HTL
   */
  swapId?: string
  /**
   * _no offical description_
   */
  proposalId: string | null
}

export type Txs = Tx[]

export type TxSide = 'RECEIVE' | 'SEND'

/**
 * Type of transactions
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#apiv1transactions
 */
export type TxType =
  | 'NEW_ORDER'
  | 'ISSUE_TOKEN'
  | 'BURN_TOKEN'
  | 'LIST_TOKEN'
  | 'CANCEL_ORDER'
  | 'FREEZE_TOKEN'
  | 'UN_FREEZE_TOKEN'
  | 'TRANSFER'
  | 'PROPOSAL'
  | 'VOTE'
  | 'MINT'
  | 'DEPOSIT'
  | 'CREATE_VALIDATOR'
  | 'REMOVE_VALIDATOR'
  | 'TIME_LOCK'
  | 'TIME_UNLOCK'
  | 'TIME_RELOCK'
  | 'SET_ACCOUNT_FLAG'
  | 'HTL_TRANSFER'
  | 'CLAIM_HTL'
  | 'DEPOSIT_HTL'
  | 'REFUND_HTL'

/**
 * Parameters for `/api/v1/transactions` endpoint
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#apiv1transactions
 */
export type GetTxsParams = {
  address?: string
  blockHeight?: number
  endTime?: number
  limit?: number
  offset?: number
  side?: TxSide
  startTime?: number
  txAsset?: string
  txType?: TxType
}

/**
 * OrderList
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#orderlist
 */
export type OrderList = {
  /**
   * total sum of orders
   */
  total: number
  /**
   * List of orders
   */
  order: [Order]
}

/**
 * Order status as part of an order
 * See description of Order.status for more detail https://docs.binance.org/api-reference/dex-api/paths.html#order
 */
export enum OrderStatus {
  Ack = 'Ack',
  PartialFill = 'PartialFill',
  IocNoFill = 'IocNoFill',
  FullyFill = 'FullyFill',
  Canceled = 'Canceled',
  Expired = 'Expired',
  FailedBlocking = 'FailedBlocking',
  FailedMatching = 'FailedMatching',
  IocExpire = 'IocExpire',
}

/**
 * Order
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#order
 */
export type Order = {
  /**
   * total amount of trades that have made
   */
  cumulateQuantity: string
  /**
   * trading fee on the latest updated block of this order. Multiple assets are split by semicolon.
   */
  fee: string
  /**
   * price of last execution
   */
  lastExecutedPrice: string
  /**
   * quantity of last execution
   */
  lastExecutedQuantity: string
  /**
   * time of order creation
   */
  orderCreateTime: number
  /**
   * Order ID
   */
  orderId: string
  /**
   * order issuer
   */
  owner: string
  /**
   * order price
   */
  price: string
  /**
   * order quantity
   */
  quantity: number
  /**
   * 1 for buy and 2 for sell
   */
  side: number
  /**
   * Order status
   */
  status: OrderStatus
  /**
   * trading pair symbol
   */
  symbol: string
  /**
   * 1 for Good Till Expire(GTE) order and 3 for Immediate Or Cancel (IOC)
   */
  timeInForce: number
  /**
   * trade ID
   */
  tradeId: string
  /**
   * hash of transaction
   */
  transactionHash: string
  /**
   * time of latest order update, for example, cancel, expire
   */
  transactionTime: number
  /**
   * only 2 is available for now, meaning limit order
   */
  type: string
}

/**
 * Balance
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#balance
 */
export type Balance = {
  /**
   * asset symbol, e.g. BNB
   */
  symbol: string
  /**
   * In decimal form, e.g. 0.00000000
   */
  free: string
  /**
   * In decimal form, e.g. 0.00000000
   */
  locked: string
  /**
   * In decimal form, e.g. 0.00000000
   */
  frozen: string
}

export type Balances = Balance[]

export type Transfer = {
  code: number
  hash: string
  log: string
  ok: boolean
}

export type Transfers = Transfer[]
/**
 * Result of  `bncClient.transfer(...)`
 * to transfer tokens from one address to another.
 * See https://github.com/binance-chain/javascript-sdk/blob/master/docs/api-docs/classes/bncclient.md#transfer
 * */
export type TransferResult = { result?: Transfers }

export type Network = keyof typeof NETWORK_PREFIX_MAPPING

export type Prefix = typeof NETWORK_PREFIX_MAPPING[Network]

export type MultiTransfer = {
  to: Address
  coins: Coin[]
}

export type Coin = {
  denom: string
  amount: number
}
