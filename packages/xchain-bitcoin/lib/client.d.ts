import * as Utils from './utils';
import { TxHistoryParams, TxsPage, Address, XChainClient, TxParams, TxHash, Balance, Network, Fees, XChainClientParams } from '@xchainjs/xchain-client';
/**
 * BitcoinClient Interface
 */
interface BitcoinClient {
    validateAddress(address: string): boolean;
    scanUTXOs(): Promise<void>;
}
declare type BitcoinClientParams = XChainClientParams & {
    nodeUrl?: string;
    nodeApiKey?: string;
};
/**
 * Implements Client declared above
 */
declare class Client implements BitcoinClient, XChainClient {
    net: Network;
    phrase: string;
    utxos: Utils.UTXO[];
    nodeUrl: string;
    nodeApiKey: string;
    constructor({ network, nodeUrl, nodeApiKey, phrase }: BitcoinClientParams);
    setNodeURL(url: string): void;
    setNodeAPIKey(key: string): void;
    generatePhrase: () => string;
    setPhrase: (phrase: string) => Address;
    purgeClient: () => void;
    setNetwork(_net: Network): void;
    getNetwork(): Network;
    getExplorerAddressUrl(address: Address): string;
    getExplorerTxUrl(txID: string): string;
    getAddress: () => Address;
    private getBtcKeys;
    validateAddress: (address: string) => boolean;
    scanUTXOs: () => Promise<void>;
    getBalance: (address?: string | undefined) => Promise<Balance[]>;
    private getChange;
    getTransactions: (params?: TxHistoryParams | undefined) => Promise<TxsPage>;
    /**
     * getFees
     */
    getFees(): Promise<Fees>;
    getFeesWithMemo(memo: string): Promise<Fees>;
    transfer({ asset, amount, recipient, memo, feeRate }: TxParams): Promise<TxHash>;
}
export { Client, Network };
