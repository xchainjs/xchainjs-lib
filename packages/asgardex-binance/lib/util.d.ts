import { Transfer } from './types/binance-ws';
/**
 * Get `hash` from transfer event sent by Binance chain
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export declare const getHashFromTransfer: (transfer?: {
    data?: Pick<Transfer, "H"> | undefined;
} | undefined) => string | undefined;
/**
 * Get `hash` from memo
 */
export declare const getTxHashFromMemo: (transfer?: import("./types/binance-ws").WSEvent<Transfer> | undefined) => string | undefined;
