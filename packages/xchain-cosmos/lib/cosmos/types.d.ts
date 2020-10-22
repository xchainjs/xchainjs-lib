import { BigSource } from 'big.js';
import { Asset } from '@thorchain/asgardex-util';
import { PrivKey } from 'cosmos-client';
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
export declare const CosmosChain = "THOR";
export declare const AssetAtom: Asset;
export declare const AssetMuon: Asset;
