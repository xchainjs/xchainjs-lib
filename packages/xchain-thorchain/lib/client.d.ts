import { Address, Balances, Fees, Network, TxParams, TxHash, TxHistoryParams, TxsPage, XChainClient, XChainClientParams } from '@xchainjs/xchain-client';
import { Asset } from '@xchainjs/xchain-util';
/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
    purgeClient(): void;
    getAddress(): string;
    validateAddress(address: string): boolean;
}
declare class Client implements ThorchainClient, XChainClient {
    private network;
    private thorClient;
    private phrase;
    private address;
    private privateKey;
    constructor({ network, phrase }: XChainClientParams);
    purgeClient(): void;
    setNetwork(network: Network): XChainClient;
    getNetwork(): Network;
    getClientUrl: () => string;
    getChainId: () => string;
    private getExplorerUrl;
    getExplorerAddressUrl: (address: Address) => string;
    getExplorerTxUrl: (txID: string) => string;
    private getPrefix;
    static generatePhrase: () => string;
    static validatePhrase: (phrase: string) => boolean;
    setPhrase: (phrase: string) => Address;
    private getPrivateKey;
    getAddress: () => string;
    validateAddress: (address: Address) => boolean;
    getBalance: (address?: string | undefined, asset?: Asset | undefined) => Promise<Balances>;
    getTransactions: (params?: TxHistoryParams | undefined) => Promise<TxsPage>;
    deposit: ({ asset, amount, recipient, memo }: TxParams) => Promise<TxHash>;
    transfer: ({ asset, amount, recipient, memo }: TxParams) => Promise<TxHash>;
    getFees: () => Promise<Fees>;
}
export { Client };
