/// <reference types="node" />
export declare const dustThreshold = 1000;
/**
 * Witness and UTXO interaces
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
export declare function getVaultFee(inputs: UTXO[], data: Buffer, feeRate: number): number;
export declare function getNormalFee(inputs: UTXO[], feeRate: number): number;
