import { BncClient } from '@binance-chain/javascript-sdk/lib/client';
import { Address, Balance, BaseXChainClient, Fees, Network, Tx, TxHash, TxHistoryParams, TxParams, TxsPage, XChainClient, XChainClientParams } from '@xchainjs/xchain-client';
import { Asset, BaseAmount } from '@xchainjs/xchain-util';
import { Account } from './types/binance';
export declare type Coin = {
    asset: Asset;
    amount: BaseAmount;
};
export declare type MultiTransfer = {
    to: Address;
    coins: Coin[];
};
export declare type MultiSendParams = {
    walletIndex?: number;
    transactions: MultiTransfer[];
    memo?: string;
};
/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
    purgeClient(): void;
    getBncClient(): BncClient;
    getAccount(address?: Address, index?: number): Promise<Account>;
    getMultiSendFees(): Promise<Fees>;
    getSingleAndMultiFees(): Promise<{
        single: Fees;
        multi: Fees;
    }>;
    multiSend(params: MultiSendParams): Promise<TxHash>;
}
/**
 * Custom Binance client
 */
declare class Client extends BaseXChainClient implements BinanceClient, XChainClient {
    private bncClient;
    /**
     * Constructor
     *
     * Client has to be initialised with network type and phrase.
     * It will throw an error if an invalid phrase has been passed.
     *
     * @param {XChainClientParams} params
     *
     * @throws {"Invalid phrase"} Thrown if the given phase is invalid.
     */
    constructor(params: XChainClientParams);
    /**
     * Get the BncClient interface.
     *
     * @returns {BncClient} The BncClient from `@binance-chain/javascript-sdk`.
     */
    getBncClient(): BncClient;
    /**
     * Gets the current network, and enforces type limited to
     * 'mainnet' and 'testnet', which conflicts with `xchain-client`
     *
     * Remove this once @binance-chain has stagenet support.
     * @returns {Network}
     */
    getNetwork(): Network.Mainnet | Network.Testnet;
    /**
     * Set/update the current network.
     *
     * @param {Network} network
     * @returns {void}
     *
     * @throws {"Network must be provided"}
     * Thrown if network has not been set before.
     */
    setNetwork(network: Network.Mainnet | Network.Testnet): void;
    /**
     * Get the client url.
     *
     * @returns {string} The client url for binance chain based on the network.
     */
    private getClientUrl;
    /**
     * Get the explorer url.
     *
     * @returns {string} The explorer url based on the network.
     */
    getExplorerUrl(): string;
    /**
     * Get the explorer url for the given address.
     *
     * @param {Address} address
     * @returns {string} The explorer url for the given address based on the network.
     */
    getExplorerAddressUrl(address: Address): string;
    /**
     * Get the explorer url for the given transaction id.
     *
     * @param {string} txID
     * @returns {string} The explorer url for the given transaction id based on the network.
     */
    getExplorerTxUrl(txID: string): string;
    /**
     * @private
     * Get private key.
     *
     * @param {number} index account index for the derivation path
     * @returns {PrivKey} The privkey generated from the given phrase
     *
     * @throws {"Phrase not set"}
     * Throws an error if phrase has not been set before
     * */
    private getPrivateKey;
    /**
     * Get the current address.
     *
     * @param {number} index (optional) Account index for the derivation path
     * @returns {Address} The current address.
     *
     * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
     */
    getAddress(index?: number): string;
    /**
     * Validate the given address.
     *
     * @param {Address} address
     * @returns {boolean} `true` or `false`
     */
    validateAddress(address: Address): boolean;
    /**
     * Get account data of wallets or by given address.
     *
     * @param {Address} address (optional) By default, it will return account data of current wallet.
     * @param {number} index (optional) Account index for the derivation path
     *
     * @returns {Account} account details of given address.
     */
    getAccount(address?: Address, index?: number): Promise<Account>;
    /**
     * Get the balance of a given address.
     *
     * @param {Address} address By default, it will return the balance of the current wallet. (optional)
     * @param {Asset} asset If not set, it will return all assets available. (optional)
     * @returns {Balance[]} The balance of the address.
     */
    getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>;
    /**
     * @private
     * Search transactions with parameters.
     *
     * @returns {Params} The parameters to be used for transaction search.
     * */
    private searchTransactions;
    /**
     * Get transaction history of a given address with pagination options.
     * By default it will return the transaction history of the current wallet.
     *
     * @param {TxHistoryParams} params The options to get transaction history. (optional)
     * @returns {TxsPage} The transaction history.
     */
    getTransactions(params?: TxHistoryParams): Promise<TxsPage>;
    /**
     * Get the transaction details of a given transaction id.
     *
     * @param {string} txId The transaction id.
     * @returns {Tx} The transaction details of the given transaction id.
     */
    getTransactionData(txId: string): Promise<Tx>;
    /**
     * Broadcast multi-send transaction.
     *
     * @param {MultiSendParams} params The multi-send transfer options.
     * @returns {TxHash} The transaction hash.
     */
    multiSend({ walletIndex, transactions, memo }: MultiSendParams): Promise<TxHash>;
    /**
     * Transfer balances.
     *
     * @param {TxParams} params The transfer options.
     * @returns {TxHash} The transaction hash.
     */
    transfer({ walletIndex, asset, amount, recipient, memo }: TxParams): Promise<TxHash>;
    /**
     * Get the current transfer fee.
     *
     * @returns {TransferFee} The current transfer fee.
     */
    private getTransferFee;
    /**
     * Get the current fee.
     *
     * @returns {Fees} The current fee.
     */
    getFees(): Promise<Fees>;
    /**
     * Get the current fee for multi-send transaction.
     *
     * @returns {Fees} The current fee for multi-send transaction.
     */
    getMultiSendFees(): Promise<Fees>;
    /**
     * Get the current fee for both single and multi-send transaction.
     *
     * @returns {SingleAndMultiFees} The current fee for both single and multi-send transaction.
     */
    getSingleAndMultiFees(): Promise<{
        single: Fees;
        multi: Fees;
    }>;
}
export { Client };
