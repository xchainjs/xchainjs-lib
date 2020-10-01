export declare type FeeOption = {
    feeRate: number;
    feeTotal: number;
};
export declare type FeeOptionsKey = 'fast' | 'regular' | 'slow';
export declare type FeeOptions = Record<FeeOptionsKey, FeeOption>;
export declare type NormalTxParams = {
    addressTo: string;
    amount: number;
    feeRate: number;
};
export declare type VaultTxParams = NormalTxParams & {
    memo: string;
};
