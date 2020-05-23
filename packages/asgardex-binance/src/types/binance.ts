/**
 * Type definitions for Binance Chain API
 * @see https://docs.binance.org/api-reference/dex-api/
 *
 */

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
  tx: [Tx]
}

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
  data: string
  /**
   * From address
   */
  fromAddr: Address
  /**
   * Order ID
   */
  orderId: string
  /**
   * Time of transaction
   */
  timeStamp: number
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
  txType: string
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
  proposalId: string
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

/**
 * Result of  `bncClient.transfer(...)`
 * to transfer tokens from one address to another.
 * See https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclienttransferfromaddress-toaddress-amount-asset-memo-sequence--promise
 * */
export type TransferResult = { result?: Transfer[] }

export type Transfer = {
  code: number
  hash: string
  log: string
  ok: boolean
}

export enum Network {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

/**
 * Binance Chain Client
 * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#module_client.BncClient
 * */
export interface BncClient {
  /**
   * Sets the client network (testnet or mainnet).
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclientchoosenetworknetwork
   */
  chooseNetwork(network: Network): void

  /**
   * Initialize the client with the chain's ID. Asynchronous.
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclientinitchain--promise
   */
  initChain(): Promise<BncClient>

  /**
   * Sets the client's private key for calls made by this client.
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclientsetprivatekeyprivatekey-localonly--promise
   */
  setPrivateKey(privateKey: string, localOnly?: boolean): Promise<BncClient>

  /**
   * Validates an address.
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclientcheckaddressaddress-prefix--boolean
   */
  checkAddress(address: Address, prefix: string): boolean

  /**
   * Getter for Binance DEX url
   */
  getBinanceUrl(): string

  /**
   * Getter for prefix
   */
  getPrefix(): string

  /**
   * Validates an address.
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#cryptocheckaddress--boolean
   */
  isValidAddress(address: Address): boolean

  /**
   * Get balances
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#clientgetbalancesbalances
   */
  getBalance(address: Address): Promise<Balance>

  /**
   *   Get Transactions
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclientgettransactionsaddress-offset--promise
   */
  getTransactions(address: Address, offset: number): Promise<any>

  /**
   * Get markets
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclientgetmarketsoffset-limit--promise
   */
  getMarkets(limit: number, offset: number): Promise<Market>

  /**
   * Create and sign a multi send tx
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclientmultisendfromaddress-outputs-memo-sequence--promise
   */
  multiSend(fromAddress: Address, outputs: MultiTransfer[], memo?: string, sequence?: number): Promise<TransferResult>

  /**
   * Transfer tokens from one address to another.
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#bncclienttransferfromaddress-toaddress-amount-asset-memo-sequence--promise
   */
  transfer(
    fromAddress: Address,
    toAddress: Address,
    amount: number,
    asset: string,
    memo?: string,
    sequence?: number,
  ): Promise<TransferResult>

  /**
   * crypto
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#crypto
   */
  crypto: BNBCrypto
}

type BNBCrypto = {
  /**
   * Checks whether an address is valid.
   * https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation#cryptocheckaddress--boolean
   */
  checkAddress(address: Address, hrp: string): boolean
}

export type MultiTransfer = {
  to: Address
  coins: Coin[]
}

export type Coin = {
  denom: string
  amount: number
}
