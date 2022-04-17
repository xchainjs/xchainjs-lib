import { Address, Balance, Fee, FeeRate, Tx, TxHash, TxHistoryParams, TxParams, TxsPage, UTXOClient, XChainClientParams } from '@xchainjs/xchain-client';
export declare type DogecoinClientParams = XChainClientParams & {
    sochainUrl?: string;
    blockcypherUrl?: string;
};
/**
 * Custom Dogecoin client
 */
declare class Client extends UTXOClient {
    private sochainUrl;
    private blockcypherUrl;
    /**
     * Constructor
     * Client is initialised with network type
     * Pass strict null as nodeAuth to disable auth for node json rpc
     *
     * @param {DogecoinClientParams} params
     */
    constructor({ network, sochainUrl, blockcypherUrl, phrase, rootDerivationPaths, }: DogecoinClientParams);
    /**
     * Set/Update the sochain url.
     *
     * @param {string} url The new sochain url.
     * @returns {void}
     */
    setSochainUrl(url: string): void;
    /**
     * Set/Update the blockcypher url.
     *
     * @param {string} url The new blockcypher url.
     * @returns {void}
     */
    setBlockcypherUrl(url: string): void;
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
     * Get the current address.
     *
     * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
     * The address is then decoded into type P2WPKH and returned.
     *
     * @returns {Address} The current address.
     *
     * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
     * @throws {"Address not defined"} Thrown if failed creating account from phrase.
     */
    getAddress(index?: number): Address;
    /**
     * @private
     * Get private key.
     *
     * Private function to get keyPair from the this.phrase
     *
     * @param {string} phrase The phrase to be used for generating privkey
     * @returns {ECPairInterface} The privkey generated from the given phrase
     *
     * @throws {"Could not get private key from phrase"} Throws an error if failed creating Doge keys from the given phrase
     * */
    private getDogeKeys;
    /**
     * Validate the given address.
     *
     * @param {Address} address
     * @returns {boolean} `true` or `false`
     */
    validateAddress(address: string): boolean;
    /**
     * Get the Doge balance of a given address.
     *
     * @param {Address} address By default, it will return the balance of the current wallet. (optional)
     * @returns {Balance[]} The Doge balance of the address.
     */
    getBalance(address: Address): Promise<Balance[]>;
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
    protected getSuggestedFeeRate(): Promise<FeeRate>;
    protected calcFee(feeRate: FeeRate, memo?: string): Promise<Fee>;
    /**
     * Transfer Doge.
     *
     * @param {TxParams&FeeRate} params The transfer options.
     * @returns {TxHash} The transaction hash.
     */
    transfer(params: TxParams & {
        feeRate?: FeeRate;
    }): Promise<TxHash>;
}
export { Client };
