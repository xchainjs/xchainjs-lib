/// <reference types="node" />
import { Address, Balance, FeeOption, Fees, Network, TxHash } from '@xchainjs/xchain-client';
export declare type FeeRate = number;
export declare type FeeRates = Record<FeeOption, FeeRate>;
export declare type FeesWithRates = {
    rates: FeeRates;
    fees: Fees;
};
export declare type NormalTxParams = {
    addressTo: Address;
    amount: number;
    feeRate: FeeRate;
};
export declare type VaultTxParams = NormalTxParams & {
    memo: string;
};
export declare type DerivePath = Record<Network, string>;
export declare type ClientUrl = Record<Network, string>;
export declare type Witness = {
    value: number;
    script: Buffer;
};
export declare type UTXO = {
    hash: TxHash;
    index: number;
    value: number;
    witnessUtxo: Witness;
    address: Address;
    txHex: string;
};
export declare type GetChangeParams = {
    valueOut: number;
    bchBalance: Balance;
};
