export declare enum Network {
    TEST = "testnet",
    MAIN = "mainnet"
}
export declare enum Path {
    address = "address",
    tx = "tx"
}
export interface Balance {
    coin: string;
    amount: number;
}
export declare type TxPage = {
    from: string;
    to: string;
    amount: number;
    date: string;
};
export declare type Address = string;
export declare type TransferResult = string;
export declare type TxParams = {
    asset: string;
    amount: number;
    recipient: Address;
    feeRate: number;
    memo?: string;
};
export declare type Fees = {
    fast: number;
    average: number;
    slow: number;
};
export interface AsgardexClient {
    setNetwork(net: Network): void;
    getNetwork(): Network;
    getExplorerUrl(type: Path, param: string): string;
    setNodeURL(url: string): void;
    setNodeAPIKey(key: string): void;
    setPhrase(phrase: string): Address;
    getBalance(address?: string): Promise<Balance[]>;
    transfer(params: TxParams): Promise<TransferResult>;
    deposit(params: TxParams): Promise<TransferResult>;
    getFees(): Promise<Fees>;
}
