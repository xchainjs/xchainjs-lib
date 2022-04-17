import { TxHash } from '@xchainjs/xchain-client';
export declare type AddressParams = {
    haskoinUrl: string;
    address: string;
};
export declare type TxHashParams = {
    haskoinUrl: string;
    txId: TxHash;
};
export declare type NodeAuth = {
    username: string;
    password: string;
};
export declare type BroadcastTxParams = {
    txHex: string;
    haskoinUrl: string;
};
export declare type ErrorResponse = {
    error: string;
};
export declare type AddressBalance = {
    received: number;
    utxo: number;
    address: string;
    txs: number;
    unconfirmed: number;
    confirmed: number;
};
export declare type TransactionInput = {
    pkscript: string;
    value: number;
    address: string | null;
    witness: string[];
    sequence: number;
    output: number;
    sigscript: string;
    coinbase: boolean;
    txid: string;
};
export declare type TransactionOutput = {
    spent: boolean;
    pkscript: string;
    value: number;
    address: string | null;
    spender: {
        input: number;
        txid: string;
    } | null;
};
export declare type Transaction = {
    time: number;
    size: number;
    inputs: TransactionInput[];
    weight: number;
    fee: number;
    locktime: number;
    block: {
        height: number;
        position: number;
    };
    outputs: TransactionOutput[];
    version: number;
    deleted: boolean;
    rbf: boolean;
    txid: string;
};
export declare type RawTransaction = {
    result: string;
};
export declare type TransactionsQueryParam = {
    offset?: number;
    limit?: number;
};
export declare type TxUnspent = {
    pkscript: string;
    value: number;
    address: string;
    block: {
        height: number;
        position: number;
    };
    index: number;
    txid: string;
};
