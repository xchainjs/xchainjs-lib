import { Balance, BaseXChainClient, Fees, Network, Tx, TxHistoryParams, TxParams, TxsPage, XChainClient, XChainClientParams } from '@xchainjs/xchain-client';
import { Asset } from '@xchainjs/xchain-util';
export declare type SearchTxParams = {
    messageAction?: string;
    messageSender?: string;
    transferSender?: string;
    transferRecipient?: string;
    page?: number;
    limit?: number;
    txMinHeight?: number;
    txMaxHeight?: number;
};
export declare type TerraClientConfig = {
    explorerURL: string;
    explorerAddressURL: string;
    explorerTxURL: string;
    cosmosAPIURL: string;
    ChainID: string;
};
export declare type TerraClientParams = {
    explorerURL?: string;
    explorerAddressURL?: string;
    explorerTxURL?: string;
    cosmosAPIURL?: string;
    ChainID?: string;
};
/**
 * Terra Client
 */
declare class Client extends BaseXChainClient implements XChainClient {
    private lcdClient;
    private config;
    constructor({ network, phrase, rootDerivationPaths, explorerURL, explorerAddressURL, explorerTxURL, cosmosAPIURL, ChainID, }: XChainClientParams & TerraClientParams);
    getFees(): Promise<Fees>;
    getAddress(walletIndex?: number): string;
    getExplorerUrl(): string;
    getExplorerAddressUrl(address: string): string;
    getExplorerTxUrl(txID: string): string;
    validateAddress(address: string): boolean;
    getBalance(address: string, assets?: Asset[]): Promise<Balance[]>;
    setNetwork(network: Network): void;
    getTransactions(params?: TxHistoryParams): Promise<TxsPage>;
    getTransactionData(txId: string): Promise<Tx>;
    transfer({ walletIndex, asset, amount, recipient, memo }: TxParams): Promise<string>;
    private getTerraNativeAsset;
    private coinsToBalances;
    private convertSearchResultTxToTx;
    private convertTxInfoToTx;
    private convertMsgSend;
    private convertMsgMultiSend;
}
export { Client };
