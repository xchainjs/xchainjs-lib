import { Address, FeeRate, Network } from '@xchainjs/xchain-client';
export declare type NormalTxParams = {
    addressTo: Address;
    amount: number;
    feeRate: FeeRate;
};
export declare type VaultTxParams = NormalTxParams & {
    memo: string;
};
export declare type GetChangeParams = {
    valueOut: number;
    sochainUrl: string;
    network: Network;
    address: Address;
};
