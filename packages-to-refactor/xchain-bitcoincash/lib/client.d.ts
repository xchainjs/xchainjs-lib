import { Address, Balance, Fee, FeeRate, Tx, TxHash, TxHistoryParams, TxParams, TxsPage, UTXOClient, XChainClientParams } from '@xchainjs/xchain-client';
import { ClientUrl } from './types/client-types';
export declare type BitcoinCashClientParams = XChainClientParams & {
    haskoinUrl?: ClientUrl;
};
/**
 * Custom Bitcoin Cash client
 */
declare class Client extends UTXOClient {
    private haskoinUrl;
    /**
     * Constructor
     * Client is initialised with network type
     *
     * @param {BitcoinCashClientParams} params
     */
    constructor({ network, haskoinUrl, phrase, rootDerivationPaths, }: BitcoinCashClientParams);
    /**
     * Set/Update the haskoin url.
     *
     * @param {string} url The new haskoin url.
     * @returns {void}
     */
    setHaskoinURL(url: ClientUrl): void;
    /**
     * Get the haskoin url.
     *
     * @returns {string} The haskoin url based on the current network.
     */
    getHaskoinURL(): string;
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
     * @private
     * Get private key.
     *
     * Private function to get keyPair from the this.phrase
     *
     * @param {string} phrase The phrase to be used for generating privkey
     * @param {string} derivationPath BIP44 derivation path
     * @returns {PrivateKey} The privkey generated from the given phrase
     *
     * @throws {"Invalid phrase"} Thrown if invalid phrase is provided.
     * */
    private getBCHKeys;
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
     * Validate the given address.
     *
     * @param {Address} address
     * @returns {boolean} `true` or `false`
     */
    validateAddress(address: string): boolean;
    /**
     * Get the BCH balance of a given address.
     *
     * @param {Address} address By default, it will return the balance of the current wallet. (optional)
     * @returns {Balance[]} The BCH balance of the address.
     *
     * @throws {"Invalid address"} Thrown if the given address is an invalid address.
     */
    getBalance(address: Address): Promise<Balance[]>;
    /**
     * Get transaction history of a given address with pagination options.
     * By default it will return the transaction history of the current wallet.
     *
     * @param {TxHistoryParams} params The options to get transaction history. (optional)
     * @returns {TxsPage} The transaction history.
     *
     * @throws {"Invalid address"} Thrown if the given address is an invalid address.
     */
    getTransactions({ address, offset, limit }: TxHistoryParams): Promise<TxsPage>;
    /**
     * Get the transaction details of a given transaction id.
     *
     * @param {string} txId The transaction id.
     * @returns {Tx} The transaction details of the given transaction id.
     *
     * @throws {"Invalid TxID"} Thrown if the given transaction id is an invalid one.
     */
    getTransactionData(txId: string): Promise<Tx>;
    protected getSuggestedFeeRate(): Promise<FeeRate>;
    protected calcFee(feeRate: FeeRate, memo?: string): Promise<Fee>;
    /**
     * Transfer BCH.
     *
     * @param {TxParams&FeeRate} params The transfer options.
     * @returns {TxHash} The transaction hash.
     */
    transfer(params: TxParams & {
        feeRate?: FeeRate;
    }): Promise<TxHash>;
}
export { Client };
