/**
 * Type definitions for data of Binance WebSocket Streams
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html
 *
 */
export declare type Asset = {
    /**
     * Asset symbol
     */
    a: string;
    /**
     * Asset value
     */
    A: string;
};
export declare type Assets = Asset[];
/**
 * Event type of WS streams
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html
 */
export declare type WSEvent<T> = {
    /**
     * Name of the event
     */
    stream: string;
    /**
     * Event payload
     */
    data?: T;
};
/**
 * Payload of a order event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#1-orders
 */
export declare type Order = {
    e: string;
    E: number;
    s: string;
    S: number;
    o: number;
    f: number;
    q: string;
    p: string;
    x: string;
    X: string;
    i: string;
    l: string;
    z: string;
    L: string;
    n: string;
    T: number;
    t: string;
    O: number;
};
export declare type Orders = Order[];
/**
 * Orders event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#1-orders
 */
export declare type OrdersEvent = WSEvent<Orders>;
export declare type Balance = {
    a: string;
    f: string;
    l: string;
    r: string;
};
export declare type Balances = Balance[];
export declare type Account = {
    e: string;
    E: number;
    B: Balances;
};
export declare type Accounts = Account[];
/**
 * Accounts event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#2-account
 */
export declare type AccountsEvent = WSEvent<Accounts>;
export declare type AccountTrade = {
    /**
     * Receiver address
     */
    o: string;
    /**
     * Asset to trade
     */
    c: Assets;
};
export declare type AccountTrades = AccountTrade[];
/**
 * Payload of a transfer event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export declare type Transfer = {
    /**
     * Event type
     */
    e: string;
    /**
     * Event heihgt
     */
    E: number;
    /**
     * Tx hash
     */
    H: string;
    /**
     * Memo
     */
    M: string;
    /**
     * Sender address
     */
    f: string;
    t: AccountTrades;
};
/**
 * Transfer event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export declare type TransferEvent = WSEvent<Transfer>;
/**
 * Taker (as part of {@link Trade})
 */
export declare enum Taker {
    UNKNOWN = 0,
    SELL_TAKER = 1,
    BUY_TAKER = 2,
    BUY_SURPLUS = 3,
    SELL_SURPLUS = 4,
    NEUTRAL = 5
}
/**
 * Trade event payload
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#4-trades
 */
export declare type Trade = {
    e: string;
    E: number;
    s: string;
    t: string;
    p: string;
    q: string;
    b: string;
    a: string;
    T: number;
    sa: string;
    ba: string;
    tt: Taker;
};
/**
 * Trades event payload
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#4-trades
 */
export declare type Trades = Trade;
/**
 * Trade event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#4-trades
 */
export declare type TradesEvent = WSEvent<Trades>;
export declare type Kline = {
    t: number;
    T: number;
    s: string;
    i: string;
    f: string;
    L: string;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
};
export declare type KlineData = {
    e: string;
    E: number;
    s: string;
    k: Kline;
};
/**
 * Kline/Candlestick event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#7-klinecandlestick-streams
 */
export declare type KlineDataEvent = WSEvent<KlineData>;
/**
 * Payload of symbol ticker event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#8-individual-symbol-ticker-streams
 */
export declare type SymbolTicker = {
    e: string;
    E: number;
    s: string;
    p: string;
    P: string;
    w: string;
    x: string;
    c: string;
    Q: string;
    b: string;
    B: string;
    a: string;
    A: string;
    o: string;
    h: string;
    l: string;
    v: string;
    q: string;
    O: number;
    C: number;
    F: string;
    L: string;
    n: number;
};
/**
 * Symbol ticker event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#8-individual-symbol-ticker-streams
 */
export declare type SymbolTickerEvent = WSEvent<SymbolTicker>;
export declare type SymbolTickers = SymbolTicker[];
/**
 * Symbol tickers event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#9-all-symbols-ticker-streams
 */
export declare type SymbolTickersEvent = WSEvent<SymbolTickers>;
export declare type MiniTicker = {
    e: string;
    E: number;
    s: string;
    c: string;
    o: string;
    h: string;
    l: string;
    v: string;
    q: string;
};
/**
 * Payload of a mini ticker event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#10-individual-symbol-mini-ticker-streams
 */
export declare type MiniTickerEvent = WSEvent<MiniTicker>;
export declare type MiniTickers = MiniTicker[];
/**
 * Payload of a mini tickers event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#10-individual-symbol-mini-ticker-streams
 */
export declare type MiniTickersEvent = WSEvent<MiniTickers>;
export declare type BlockHeight = {
    h: number;
};
/**
 * Payload of block height event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#12-blockheight
 */
export declare type BlockHeightEvent = WSEvent<BlockHeight>;
