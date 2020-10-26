import { BigSource } from 'big.js';
import { Asset } from '@xchainjs/xchain-util';
import { PrivKey, Msg } from 'cosmos-client';
import { BaseAccount, StdTx } from 'cosmos-client/x/auth';
export declare const CosmosChain = "THOR";
export declare const AssetAtom: Asset;
export declare const AssetMuon: Asset;
export declare type SearchTxParams = {
    messageAction?: string;
    messageSender?: string;
    page?: number;
    limit?: number;
    txMinHeight?: number;
    txMaxHeight?: number;
};
export declare type TransferParams = {
    privkey: PrivKey;
    from: string;
    to: string;
    amount: BigSource;
    asset: string;
    memo?: string;
};
export declare type BaseAccountResponse = {
    type?: string;
    value?: BaseAccount;
};
export declare type RawTxResponse = {
    body: {
        messages: Msg[];
    };
};
export declare type TxResponse = {
    height?: number;
    txhash?: string;
    raw_log?: string;
    gas_wanted?: string;
    gas_used?: string;
    tx?: StdTx | RawTxResponse;
    timestamp: string;
};
export declare type TxHistoryResponse = {
    total_count?: number;
    count?: number;
    page_number?: number;
    page_total?: number;
    limit?: number;
    txs?: Array<TxResponse>;
};
export declare type APIQueryParam = {
    [x: string]: string;
};
