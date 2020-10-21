import { Utxos, Txs, Tx, Estimates, Blocks, Address } from './types/electrs-api-types';
export declare const getAddressUtxos: (baseUrl: string, address: string) => Promise<Utxos>;
export declare const getAddressTxs: (baseUrl: string, address: string) => Promise<Txs>;
export declare const getFeeEstimates: (baseUrl: string) => Promise<Estimates>;
export declare const getBlocks: (baseUrl: string, startHeight?: number | undefined) => Promise<Blocks>;
export declare const getTxInfo: (baseUrl: string, txId: string) => Promise<Tx>;
export declare const getAddressInfo: (baseUrl: string, address: string) => Promise<Address>;
export declare const broadcastTx: (baseUrl: string, txhex: string) => Promise<string>;
