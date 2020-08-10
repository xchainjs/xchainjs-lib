/// <reference types="node" />
export declare const dustThreshold = 1000;
/**
 * Interaces
 */
export interface Witness {
    value: number;
    script: Buffer;
}
export interface UTXO {
    hash: string;
    index: number;
    witnessUtxo: Witness;
}
export interface FeeOption {
    feeRate: number;
    estimatedFee: number;
    estimatedTxTime: number;
}
export interface FeeOptions {
    [index: string]: FeeOption;
}
export declare function getVaultFee(inputs: UTXO[], data: Buffer, feeRate: number): number;
export declare function getNormalFee(inputs: UTXO[], feeRate: number): number;
export declare function arrayAverage(array: Array<number>): number;
export declare function filterByKeys(obj: object, filterKeys: Array<string>): {};
