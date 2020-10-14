import { BtcAddressDTO, Transactions, RawTxsBTC, ChainStatsBtc } from './types/blockchair-api-types';
/**
 * https://blockchair.com/api/docs#link_200
 * @param chain
 * @param hash
 */
export declare const getTx: (baseUrl: string, hash: string, apiKey?: string | undefined) => Promise<Transactions>;
/**
 * https://blockchair.com/api/docs#link_201
 * @param chain
 * @param hash
 */
export declare const getRawTx: (baseUrl: string, hash: string, apiKey?: string | undefined) => Promise<RawTxsBTC>;
/**
 * https://blockchair.com/api/docs#link_300
 * @param chain
 * @param address
 */
export declare const getAddress: (baseUrl: string, address: string, apiKey?: string | undefined, limit?: number | undefined, offset?: number | undefined) => Promise<BtcAddressDTO>;
/**
 * https://blockchair.com/api/docs#link_202
 * @param chain
 * @param txHex
 */
export declare const broadcastTx: (baseUrl: string, txHex: string, apiKey?: string | undefined) => Promise<string>;
/**
 * https://blockchair.com/api/docs#link_001
 * @param chain
 */
export declare const bitcoinStats: (baseUrl: string, apiKey?: string | undefined) => Promise<ChainStatsBtc>;
