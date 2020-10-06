import { Asset, BaseAmount } from "@thorchain/asgardex-util";
export declare type Address = string;
export declare type Network = 'testnet' | 'mainnet';
export declare type Balance = {
    asset: Asset;
    amount: BaseAmount;
    frozenAmount?: BaseAmount;
};
export declare type Balances = Balance[];
declare type TxType = 'transfer' | 'freeze' | 'unfreeze' | 'unkown';
declare type TxTo = {
    address: string;
    amount: BaseAmount;
};
declare type Tx = {
    asset: Asset;
    from: Address;
    to: TxTo[];
    date: Date;
    type: TxType;
    hash: string;
};
declare type Txs = Tx[];
declare type TxsPage = {
    total: number;
    txs: Txs;
};
declare type TxHistoryParams = {
    address: Address;
    offset?: number;
    limit?: number;
    startTime?: Date;
};
declare type TxHash = string;
declare type TxParams = {
    asset: Asset;
    amount: BaseAmount;
    recipient: Address;
    feeRate?: number;
    memo?: string;
};
declare type FeeType = 'byte' | 'base';
declare type Fees = {
    type: FeeType;
    fastest?: number;
    fast?: number;
    average: number;
};
export declare type AsgardexClientParams = {
    network?: Network;
    phrase: string;
};
export interface AsgardexClient {
    setNetwork(net: Network): void;
    getNetwork(): Network;
    getExplorerAddressUrl(): string;
    getExplorerTxUrl(): string;
    getAddress(): Address;
    setPhrase(phrase: string): Address;
    getBalance(address?: Address, asset?: Asset): Promise<Balances>;
    getTransactions(params?: TxHistoryParams): Promise<TxsPage>;
    getFees(): Promise<Fees>;
    transfer(params: TxParams): Promise<TxHash>;
    deposit(params: TxParams): Promise<TxHash>;
    purgeClient(): void;
}
export {};
