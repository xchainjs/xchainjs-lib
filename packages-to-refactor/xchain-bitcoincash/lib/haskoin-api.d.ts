import { TxHash } from '@xchainjs/xchain-client/lib';
import { AddressBalance, AddressParams, BroadcastTxParams, Transaction, TransactionsQueryParam, TxHashParams, TxUnspent } from './types';
/**
 * Get account from address.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {AddressBalance}
 *
 * @throws {"failed to query account by a given address"} thrown if failed to query account by a given address
 */
export declare const getAccount: ({ haskoinUrl, address }: AddressParams) => Promise<AddressBalance>;
/**
 * Get transaction by hash.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} txId The transaction id.
 * @returns {Transaction}
 *
 * @throws {"failed to query transaction by a given hash"} thrown if failed to query transaction by a given hash
 */
export declare const getTransaction: ({ haskoinUrl, txId }: TxHashParams) => Promise<Transaction>;
/**
 * Get raw transaction by hash.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} txId The transaction id.
 * @returns {Transaction}
 *
 * @throws {"failed to query transaction by a given hash"} thrown if failed to query raw transaction by a given hash
 */
export declare const getRawTransaction: ({ haskoinUrl, txId }: TxHashParams) => Promise<string>;
/**
 * Get transaction history.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @param {TransactionsQueryParam} params The API query parameters.
 * @returns {Transaction[]}
 *
 * @throws {"failed to query transactions"} thrown if failed to query transactions
 */
export declare const getTransactions: ({ haskoinUrl, address, params, }: AddressParams & {
    params: TransactionsQueryParam;
}) => Promise<Transaction[]>;
/**
 * Get unspent transactions.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {TxUnspent[]}
 *
 * @throws {"failed to query unspent transactions"} thrown if failed to query unspent transactions
 */
export declare const getUnspentTransactions: ({ haskoinUrl, address }: AddressParams) => Promise<TxUnspent[]>;
/**
 * Get suggested fee amount for Bitcoin cash. (fee per byte)
 *
 * @returns {number} The Bitcoin cash stats.
 */
export declare const getSuggestedFee: () => Promise<number>;
/**
 * Broadcast transaction.
 *
 * @see https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3#/blockchain/sendTransaction
 *
 * @param {BroadcastTxParams} params
 * @returns {TxHash} Transaction hash.
 */
export declare const broadcastTx: ({ txHex, haskoinUrl }: BroadcastTxParams) => Promise<TxHash>;
