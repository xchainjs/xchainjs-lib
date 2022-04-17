import { Fees, Network, Tx, TxType } from '@xchainjs/xchain-client';
import { Account, DexFees, Fee, TransferFee, Tx as BinanceTx, TxType as BinanceTxType } from './types/binance';
import { Transfer, TransferEvent } from './types/binance-ws';
import { DerivePath } from './types/common';
/**
 * Get `hash` from transfer event sent by Binance chain.
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 *
 * @param {TransferEvent} transfer The transfer event. (optional)
 * @returns {string|undefined} The hash from transfer event.
 */
export declare const getHashFromTransfer: (transfer?: {
    data?: Pick<Transfer, "H"> | undefined;
} | undefined) => string | undefined;
/**
 * Get `hash` from memo
 *
 * @param {TransferEvent} transfer The transfer event. (optional)
 * @returns {string|undefined} The hash from the memo.
 */
export declare const getTxHashFromMemo: (transfer?: TransferEvent | undefined) => string | undefined;
/**
 * Type guard for runtime checks of `Fee`
 *
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export declare const isFee: (v: Fee | TransferFee | DexFees) => v is Fee;
/**
 * Type guard for `TransferFee`
 *
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export declare const isTransferFee: (v: Fee | TransferFee | DexFees) => v is TransferFee;
/**
 * Type guard for `DexFees`
 *
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export declare const isDexFees: (v: Fee | TransferFee | DexFees) => v is DexFees;
/**
 * Type guard for `Account`
 *
 * @param {unknown} v
 * @returns {boolean} `true` or `false`.
 */
export declare const isAccount: (v: unknown) => v is Account;
/**
 * Get TxType
 *
 * @param {BinanceTxType} t
 * @returns {TxType} `transfer` or `unknown`.
 */
export declare const getTxType: (t: BinanceTxType) => TxType;
/**
 * Parse Tx
 *
 * @param {BinanceTx} t The transaction to be parsed. (optional)
 * @returns {Tx|null} The transaction parsed from the binance tx.
 */
export declare const parseTx: (tx: BinanceTx) => Tx | null;
/**
 * Get DerivePath
 *
 * @param {number} index (optional)
 * @returns {DerivePath} The binance derivation path by the index.
 */
export declare const getDerivePath: (index?: number) => DerivePath;
/**
 * Get the default fee.
 *
 * @returns {Fees} The default fee.
 */
export declare const getDefaultFees: () => Fees;
/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export declare const getPrefix: (network: Network) => "bnb" | "tbnb";
