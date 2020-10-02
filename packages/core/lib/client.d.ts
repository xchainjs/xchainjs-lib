export declare type AsgardexClient = {
    setPhrase(phrase?: string): void;
    generatePhrase(): void;
    getBalance(address?: string): Promise<number>;
    getTransactions(address: string): Promise<any>;
    getExplorerUrl(): string;
    transfer(params: TxParams): any;
};
export declare type TxParams = {
    amount: number;
    recipient: string;
    memo?: string;
    feeRate: number;
};
