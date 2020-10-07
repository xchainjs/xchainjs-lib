import { Asset, BaseAmount } from '@thorchain/asgardex-util';
export declare type Address = string;
export declare type Network = 'testnet' | 'mainnet';
export declare type Balance = {
    asset: Asset;
    amount: BaseAmount;
    frozenAmount?: BaseAmount;
};
export declare type Balances = Balance[];
export declare type TxType = 'transfer' | 'freeze' | 'unfreeze' | 'unkown';
export declare type TxHash = string;
export declare type TxTo = {
    to: Address;
    amount: BaseAmount;
};
export declare type TxFrom = {
    from: Address | TxHash;
    amount: BaseAmount;
};
export declare type Tx = {
    asset: Asset;
    from: TxFrom[];
    to: TxTo[];
    date: Date;
    type: TxType;
    hash: string;
};
export declare type Txs = Tx[];
export declare type TxsPage = {
    total: number;
    txs: Txs;
};
export declare type TxHistoryParams = {
    address: Address;
    offset?: number;
    limit?: number;
    startTime?: Date;
};
export declare type TxParams = {
    asset: Asset;
    amount: BaseAmount;
    recipient: Address;
    feeRate?: number;
    memo?: string;
};
export declare type FeeType = 'byte' | 'base';
export declare type Fees = {
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
    getExplorerAddressUrl(address: Address): string;
    getExplorerTxUrl(txID: string): string;
    getAddress(): Address;
    setPhrase(phrase: string): Address;
    getBalance(address?: Address, asset?: Asset): Promise<Balances>;
    getTransactions(params?: TxHistoryParams): Promise<TxsPage>;
    getFees(): Promise<Fees>;
    transfer(params: TxParams): Promise<TxHash>;
    deposit(params: TxParams): Promise<TxHash>;
    purgeClient(): void;
}
