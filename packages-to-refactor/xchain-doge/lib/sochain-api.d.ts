import { Network } from '@xchainjs/xchain-client';
import { BaseAmount } from '@xchainjs/xchain-util';
import { DogeAddressDTO, DogeAddressUTXO, Transaction, TxHashParams } from './types/sochain-api-types';
export declare const getSendTxUrl: ({ sochainUrl, network }: {
    sochainUrl: string;
    network: Network;
}) => string;
/**
 * Get address information.
 *
 * @see https://sochain.com/api#get-display-data-address
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {DogeAddressDTO}
 */
export declare const getAddress: ({ sochainUrl, network, address, }: {
    sochainUrl: string;
    network: Network;
    address: string;
}) => Promise<DogeAddressDTO>;
/**
 * Get transaction by hash.
 *
 * @see https://sochain.com/api#get-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export declare const getTx: ({ sochainUrl, network, hash }: TxHashParams) => Promise<Transaction>;
/**
 * Get address balance.
 *
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {number}
 */
export declare const getBalance: ({ sochainUrl, network, address, }: {
    sochainUrl: string;
    network: Network;
    address: string;
}) => Promise<BaseAmount>;
/**
 * Get unspent txs
 *
 * @see https://sochain.com/api#get-unspent-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {DogeAddressUTXO[]}
 */
export declare const getUnspentTxs: ({ sochainUrl, network, address, startingFromTxId, }: {
    sochainUrl: string;
    network: Network;
    address: string;
    startingFromTxId?: string | undefined;
}) => Promise<DogeAddressUTXO[]>;
