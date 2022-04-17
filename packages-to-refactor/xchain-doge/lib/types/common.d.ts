import { Network } from '@xchainjs/xchain-client';
export declare type UTXO = {
    hash: string;
    index: number;
    value: number;
    txHex?: string;
};
export declare type BroadcastTxParams = {
    network: Network;
    txHex: string;
    nodeUrl: string;
};
