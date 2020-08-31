export interface FeeOption {
    feeRate: number;
    feeTotal: number;
}
export interface FeeOptions {
    [index: string]: FeeOption;
}
