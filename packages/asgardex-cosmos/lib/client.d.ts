import { Address, AsgardexClient, AsgardexClientParams, Balances, Fees, Network, TxParams, TxHash, TxHistoryParams, TxsPage } from '@asgardex-clients/asgardex-client';
import { Asset } from '@thorchain/asgardex-util';
/**
 * Interface for custom Cosmos client
 */
export interface CosmosClient {
    purgeClient(): void;
    getAddress(): string;
    validateAddress(address: string): boolean;
    getMainAsset(): Asset;
}
declare class Client implements CosmosClient, AsgardexClient {
    private network;
    private thorClient;
    private phrase;
    private address;
    private privateKey;
    constructor({ network, phrase }: AsgardexClientParams);
    purgeClient(): void;
    setNetwork: (network: Network) => AsgardexClient;
    getNetwork(): Network;
    getClientUrl: () => string;
    getChainId: () => string;
    private getExplorerUrl;
    getExplorerAddressUrl: (address: Address) => string;
    getExplorerTxUrl: (txID: string) => string;
    static generatePhrase: () => string;
    static validatePhrase: (phrase: string) => boolean;
    setPhrase: (phrase: string) => Address;
    private getPrivateKey;
    getAddress: () => string;
    validateAddress: (address: Address) => boolean;
    getMainAsset: () => Asset;
    getBalance: (address?: Address, asset?: Asset) => Promise<Balances>;
    getTransactions: (params?: TxHistoryParams) => Promise<TxsPage>;
    deposit: ({ asset, amount, recipient, memo }: TxParams) => Promise<TxHash>;
    transfer: ({ asset, amount, recipient, memo }: TxParams) => Promise<TxHash>;
    getFees: () => Promise<Fees>;
}
export { Client };
