import { BroadcastTxParams } from './types/common';
/**
 * Broadcast transaction.
 *
 * @see https://sochain.com/api/#send-transaction
 *
 * @returns {string} Transaction ID.
 */
export declare const broadcastTxToSochain: ({ txHex, nodeUrl }: BroadcastTxParams) => Promise<string>;
/**
 * Broadcast transaction.
 *
 * @see https://www.blockcypher.com/dev/bitcoin/#push-raw-transaction-endpoint
 *
 * @returns {string} Transaction ID.
 */
export declare const broadcastTxToBlockCypher: ({ txHex, nodeUrl }: BroadcastTxParams) => Promise<string>;
