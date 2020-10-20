/**
 * Type definitions for data of Binance WebSocket Streams
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html
 *
 */

export type Asset = {
  /**
   * Asset symbol
   */
  a: string
  /**
   * Asset value
   */
  A: string
}

export type Assets = Asset[]

/**
 * Event type of WS streams
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html
 */
export type WSEvent<T> = {
  /**
   * Name of the event
   */
  stream: string
  /**
   * Event payload
   */
  data?: T
}

/**
 * Payload of a order event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#1-orders
 */
export type Order = {
  // Event type
  e: string
  // Event height
  E: number
  // Symbol
  s: string
  // Side, 1 for Buy; 2 for Sell
  S: number
  // Order type, 2 for LIMIT (only)
  o: number
  // Time in force,  1 for Good Till Expire (GTE); 3 for Immediate Or Cancel (IOC)
  f: number
  // Order quantity
  q: string
  // Order price
  p: string
  // Current execution type
  x: string
  // Current order status, possible values Ack, Canceled, Expired, IocNoFill, PartialFill, FullyFill, FailedBlocking, FailedMatching, Unknown
  X: string
  // Order ID
  i: string
  // Last executed quantity
  l: string
  // Cumulative filled quantity
  z: string
  // Last executed price
  L: string
  // Commission amount for all user trades within a given block. Fees will be displayed with each order but will be charged once.
  // Fee can be composed of a single symbol, ex: "10000BNB"
  // or multiple symbols if the available "BNB" balance is not enough to cover the whole fees, ex: "1.00000000BNB;0.00001000BTC;0.00050000ETH"
  n: string
  // Transaction time
  T: number
  // Trade ID
  t: string
  // Order creation time
  O: number
}

export type Orders = Order[]

/**
 * Orders event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#1-orders
 */
export type OrdersEvent = WSEvent<Orders>

export type Balance = {
  // Asset
  a: string
  // Free amount
  f: string
  // Locked amount
  l: string
  // Frozen amount
  r: string
}

export type Balances = Balance[]

export type Account = {
  // Event type
  e: string
  // Event height
  E: number
  // balances
  B: Balances
}

export type Accounts = Account[]

/**
 * Accounts event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#2-account
 */
export type AccountsEvent = WSEvent<Accounts>

export type AccountTrade = {
  /**
   * Receiver address
   */
  o: string
  /**
   * Asset to trade
   */
  c: Assets
}

export type AccountTrades = AccountTrade[]

/**
 * Payload of a transfer event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export type Transfer = {
  /**
   * Event type
   */
  e: string
  /**
   * Event heihgt
   */
  E: number
  /**
   * Tx hash
   */
  H: string
  /**
   * Memo
   */
  M: string
  /**
   * Sender address
   */
  f: string
  t: AccountTrades
}

/**
 * Transfer event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export type TransferEvent = WSEvent<Transfer>

/**
 * Taker (as part of {@link Trade})
 */
export enum Taker {
  UNKNOWN,
  SELL_TAKER,
  BUY_TAKER,
  BUY_SURPLUS,
  SELL_SURPLUS,
  NEUTRAL,
}

/**
 * Trade event payload
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#4-trades
 */
export type Trade = {
  // Event type
  e: string // 'trade'
  // Event height
  E: number // 123456789
  // Symbol
  s: string // 'BNB_BTC'
  // Trade ID
  t: string // '12345'
  // Price
  p: string // '0.001'
  // Quantity
  q: string // '100'
  // Buyer order ID
  b: string // '88'
  // Seller order ID
  a: string // '50'
  // Trade time
  T: number // 123456785
  // SellerAddress
  sa: string // 'bnb1me5u083m2spzt8pw8vunprnctc8syy64hegrcp'
  // BuyerAddress
  ba: string // 'bnb1kdr00ydr8xj3ydcd3a8ej2xxn8lkuja7mdunr5'
  // takertype 0: Unknown 1: SellTaker 2: BuyTaker 3: BuySurplus 4: SellSurplus 5: Neutral
  tt: Taker
}

/**
 * Trades event payload
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#4-trades
 */
export type Trades = Trade

/**
 * Trade event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#4-trades
 */
export type TradesEvent = WSEvent<Trades>

export type Kline = {
  // Kline start time
  t: number
  // Kline close time
  T: number
  // Symbol
  s: string
  // Interval
  i: string
  // First trade ID
  f: string
  // Last trade ID
  L: string
  // Open price
  o: string
  // Close price
  c: string
  // High price
  h: string
  // Low price
  l: string
  // Base asset volume
  v: string
  // Number of trades
  n: number
  // Is this kline closed?
  x: boolean
  // Quote asset volume
  q: string
}

export type KlineData = {
  // Event type
  e: string
  // Event time
  E: number
  // Symbol
  s: string
  k: Kline
}

/**
 * Kline/Candlestick event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#7-klinecandlestick-streams
 */
export type KlineDataEvent = WSEvent<KlineData>

/**
 * Payload of symbol ticker event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#8-individual-symbol-ticker-streams
 */
export type SymbolTicker = {
  // Event type
  e: string
  // Event time
  E: number
  // Symbol
  s: string
  // Price change
  p: string
  // Price change percent
  P: string
  // Weighted average price
  w: string
  // Previous day's close price
  x: string
  // Current day's close price
  c: string
  // Close trade's quantity
  Q: string
  // Best bid price
  b: string
  // Best bid quantity
  B: string
  // Best ask price
  a: string
  // Best ask quantity
  A: string
  // Open price
  o: string
  // High price
  h: string
  // Low price
  l: string
  // Total traded base asset volume
  v: string
  // Total traded quote asset volume
  q: string
  // Statistics open time
  O: number
  // Statistics close time
  C: number
  // First trade ID
  F: string
  // Last trade Id
  L: string
  // Total number of trades
  n: number
}

/**
 * Symbol ticker event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#8-individual-symbol-ticker-streams
 */
export type SymbolTickerEvent = WSEvent<SymbolTicker>

export type SymbolTickers = SymbolTicker[]

/**
 * Symbol tickers event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#9-all-symbols-ticker-streams
 */
export type SymbolTickersEvent = WSEvent<SymbolTickers>

export type MiniTicker = {
  // Event type
  e: string
  // Event time
  E: number
  // Symbol
  s: string
  // Current day's close price
  c: string
  // Open price
  o: string
  // High price
  h: string
  // Low price
  l: string
  // Total traded base asset volume
  v: string
  // Total traded quote asset volume
  q: string
}

/**
 * Payload of a mini ticker event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#10-individual-symbol-mini-ticker-streams
 */
export type MiniTickerEvent = WSEvent<MiniTicker>

export type MiniTickers = MiniTicker[]

/**
 * Payload of a mini tickers event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#10-individual-symbol-mini-ticker-streams
 */

export type MiniTickersEvent = WSEvent<MiniTickers>

export type BlockHeight = { h: number }

/**
 * Payload of block height event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#12-blockheight
 */
export type BlockHeightEvent = WSEvent<BlockHeight>
