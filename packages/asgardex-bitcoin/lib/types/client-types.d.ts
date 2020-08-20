export interface FeeOption {
    feeRate: number;
    estimatedFee: number;
    estimatedTxTime: number;
}
export interface FeeOptions {
    [index: string]: FeeOption;
}
