import { Address, Balance, Fees, Network, Tx, TxHash, TxHistoryParams, TxParams, TxsPage, XChainClient, XChainClientParams } from '@xchainjs/xchain-client';
import { Asset } from '@xchainjs/xchain-util';
/**
 * Interface for custom Polkadot client
 */
export interface PolkadotClient {
    getSS58Format(): number;
    getWsEndpoint(): string;
    estimateFees(params: TxParams): Promise<Fees>;
}
/**
 * Custom Polkadot client
 */
declare class Client implements PolkadotClient, XChainClient {
    private network;
    private phrase;
    private rootDerivationPaths;
    /**
     * Constructor
     * Client is initialised with network type and phrase (optional)
     *
     * @param {XChainClientParams} params
     */
    constructor({ network, phrase, rootDerivationPaths, }: XChainClientParams);
    /**
     * Get getFullDerivationPath
     *
     * @param {number} index the HD wallet index
     * @returns {string} The polkadot derivation path based on the network.
     */
    getFullDerivationPath(index?: number): string;
    /**
     * Purge client.
     *
     * @returns {void}
     */
    purgeClient(): void;
    /**
     * Set/update the current network.
     *
     * @param {Network} network
     *
     * @throws {"Network must be provided"}
     * Thrown if network has not been set before.
     */
    setNetwork(network: Network): void;
    /**
     * Get the current network.
     *
     * @returns {Network}
     */
    getNetwork(): Network;
    /**
     * Get the client url.
     *
     * @returns {string} The client url based on the network.
     */
    getClientUrl(): string;
    /**
     * Get the client WebSocket url.
     *
     * @returns {string} The client WebSocket url based on the network.
     */
    getWsEndpoint(): string;
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
     * @param {string} txID The transaction id
     * @returns {string} The explorer url for the given transaction id based on the network.
     */
    getExplorerTxUrl(txID: string): string;
    /**
     * Get the SS58 format to be used for Polkadot Keyring.
     *
     * @returns {number} The SS58 format based on the network.
     */
    getSS58Format(): number;
    /**
     * Set/update a new phrase.
     *
     * @param {string} phrase A new phrase.
     * @returns {Address} The address from the given phrase
     *
     * @throws {"Invalid phrase"}
     * Thrown if the given phase is invalid.
     */
    setPhrase(phrase: string, walletIndex?: number): Address;
    /**
     * @private
     * Private function to get Keyring pair for polkadotjs provider.
     * @see https://polkadot.js.org/docs/api/start/keyring/#creating-a-keyring-instance
     *
     * @returns {KeyringPair} The keyring pair to be used to generate wallet address.
     * */
    private getKeyringPair;
    /**
     * @private
     * Private function to get the polkadotjs API provider.
     *
     * @see https://polkadot.js.org/docs/api/start/create#api-instance
     *
     * @returns {ApiPromise} The polkadotjs API provider based on the network.
     * */
    private getAPI;
    /**
     * Validate the given address.
     * @see https://polkadot.js.org/docs/util-crypto/examples/validate-address
     *
     * @param {Address} address
     * @returns {boolean} `true` or `false`
     */
    validateAddress(address: string): boolean;
    /**
     * Get the current address.
     *
     * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
     * The address is then decoded into type P2WPKH and returned.
     *
     * @returns {Address} The current address.
     *
     * @throws {"Address not defined"} Thrown if failed creating account from phrase.
     */
    getAddress(index?: number): Address;
    /**
     * Get the DOT balance of a given address.
     *
     * @param {Address} address By default, it will return the balance of the current wallet. (optional)
     * @returns {Balance[]} The DOT balance of the address.
     */
    getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>;
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
     * Transfer DOT.
     *
     * @param {TxParams} params The transfer options.
     * @returns {TxHash} The transaction hash.
     */
    transfer(params: TxParams): Promise<TxHash>;
    /**
     * Get the current fee with transfer options.
     *
     * @see https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-estimate-the-transaction-fees
     *
     * @param {TxParams} params The transfer options.
     * @returns {Fees} The estimated fees with the transfer options.
     */
    estimateFees(params: TxParams): Promise<Fees>;
    /**
     * Get the current fee.
     *
     * @returns {Fees} The current fee.
     */
    getFees(): Promise<Fees>;
}
export { Client };
