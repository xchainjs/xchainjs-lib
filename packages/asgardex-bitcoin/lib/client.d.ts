import * as Utils from './utils';
import { TxHistoryParams, TxsPage, Address, AsgardexClient, TxParams, Balance, Network, Fees, AsgardexClientParams } from '@asgardex-clients/asgardex-client';
/**
 * BitcoinClient Interface
 */
interface BitcoinClient {
    purgeClient(): void;
    validateAddress(address: string): boolean;
    scanUTXOs(): Promise<void>;
}
declare type BitcoinClientParams = AsgardexClientParams & {
    nodeUrl?: string;
    nodeApiKey?: string;
};
/**
 * Implements Client declared above
 */
declare class Client implements BitcoinClient, AsgardexClient {
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
    getAddress: () => string;
    private getBtcKeys;
    validateAddress: (address: string) => boolean;
    scanUTXOs: () => Promise<void>;
    getBalance: (address?: string | undefined) => Promise<Balance[]>;
    private getChange;
    /**
     * TODO: Add this in with correct response type
     * Requires querying tx data for each address tx
     * @param memo
     */
    getTransactions: (params?: TxHistoryParams | undefined) => Promise<TxsPage>;
    /**
     * getFees
     */
    getFees(): Promise<Fees>;
    getFeesWithMemo(memo: string): Promise<Fees>;
    deposit({ asset, amount, recipient, memo, feeRate }: TxParams): Promise<string>;
    transfer({ asset, amount, recipient, memo, feeRate }: TxParams): Promise<string>;
}
export { Client, Network };
