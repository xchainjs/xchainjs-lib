import { BncClient } from '@binance-chain/javascript-sdk/lib/client';
import { Address, AsgardexClient, AsgardexClientParams, Balances, Fees, Network, TxParams, TxHash, TxHistoryParams, TxsPage } from '@asgardex-clients/asgardex-client';
import { Asset, BaseAmount } from '@thorchain/asgardex-util';
export declare type FreezeParams = {
    asset: Asset;
    amount: BaseAmount;
    recipient?: Address;
};
export declare type Coin = {
    asset: Asset;
    amount: BaseAmount;
};
export declare type MultiTransfer = {
    to: Address;
    coins: Coin[];
};
export declare type MultiSendParams = {
    address?: Address;
    transactions: MultiTransfer[];
    memo?: string;
};
/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
    purgeClient(): void;
    getBncClient(): BncClient;
    getAddress(index?: number): string;
    validateAddress(address: string): boolean;
    getMultiSendFees(): Promise<Fees>;
    getFreezeFees(): Promise<Fees>;
    freeze(params: FreezeParams): Promise<TxHash>;
    unfreeze(params: FreezeParams): Promise<TxHash>;
    multiSend(params: MultiSendParams): Promise<TxHash>;
}
/**
 * Custom Binance client
 *
 * @class Binance
 * @implements {BinanceClient}
 */
declare class Client implements BinanceClient, AsgardexClient {
    private network;
    private bncClient;
    private phrase;
    private address;
    private privateKey;
    /**
     * Client has to be initialised with network type and phrase
     * It will throw an error if an invalid phrase has been passed
     **/
    constructor({ network, phrase }: AsgardexClientParams);
    purgeClient(): void;
    getBncClient(): BncClient;
    setNetwork(network: Network): AsgardexClient;
    getNetwork(): Network;
    private getClientUrl;
    private getExplorerUrl;
    getExplorerAddressUrl: (address: Address) => string;
    getExplorerTxUrl: (txID: string) => string;
    private getPrefix;
    static generatePhrase: () => string;
    setPhrase: (phrase: string) => Address;
    /**
     * @private
     * Returns private key
     * Throws an error if phrase has not been set before
     * */
    private getPrivateKey;
    getAddress: (index?: number | undefined) => string;
    validateAddress: (address: Address) => boolean;
    getBalance: (address?: string | undefined, asset?: Asset | undefined) => Promise<Balances>;
    getTransactions: (params?: TxHistoryParams | undefined) => Promise<TxsPage>;
    multiSend: ({ address, transactions, memo }: MultiSendParams) => Promise<TxHash>;
    deposit: ({ asset, amount, recipient, memo }: TxParams) => Promise<TxHash>;
    transfer: ({ asset, amount, recipient, memo }: TxParams) => Promise<TxHash>;
    freeze: ({ recipient, asset, amount }: FreezeParams) => Promise<TxHash>;
    unfreeze: ({ recipient, asset, amount }: FreezeParams) => Promise<TxHash>;
    getFees: () => Promise<Fees>;
    getMultiSendFees: () => Promise<Fees>;
    getFreezeFees: () => Promise<Fees>;
}
export { Client };
