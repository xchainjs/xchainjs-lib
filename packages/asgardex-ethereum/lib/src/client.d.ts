import { Wallet, Contract } from 'ethers';
import { EtherscanProvider, TransactionResponse, Provider } from 'ethers/providers';
import { BigNumberish } from 'ethers/utils';
/**
 * Class variables accessed across functions
 */
declare type Address = string;
declare type Phrase = string;
export declare enum Network {
    TEST = "rinkeby",
    MAIN = "homestead"
}
/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
    setNetwork(network: Network): Network;
    setPhrase(phrase?: string): void;
    getBalance(address: Address): Promise<BigNumberish>;
    getBlockNumber(): Promise<number>;
    getTransactions(address?: Address): Promise<Array<TransactionResponse>>;
    vaultTx(asset: string, amount: BigNumberish, memo: string): Promise<TransactionResponse>;
    normalTx(addressTo: Address, amount: BigNumberish, asset: string): Promise<TransactionResponse>;
}
/**
 * Custom Ethereum client
 * @todo Error handling
 */
export default class Client implements EthereumClient {
    private _wallet;
    private _network;
    private _phrase;
    private _provider;
    private _address;
    private _balance;
    private _etherscan;
    private _vault;
    constructor(network?: Network, phrase?: Phrase, vault?: string);
    /**
     * Getters
     */
    get address(): Address;
    get wallet(): Wallet;
    get vault(): Contract | null;
    get network(): Network;
    get provider(): Provider;
    get balance(): BigNumberish;
    get etherscan(): EtherscanProvider;
    /**
     * changes the wallet eg. when using connect() after init()
     */
    private changeWallet;
    /**
     * changes the provider
     */
    EtherscanProvider(): Provider;
    /**
     * Connects to the ethereum network with t
     */
    init(): Wallet;
    /**
     * Set's the current network
     */
    setNetwork(network: Network): Network;
    /**
     * Set's the current vault contract
     */
    setVault(vault: string): Contract;
    /**
     * Generates a new mnemonic / phrase
     */
    static generatePhrase(): Phrase;
    /**
     * Validates a mnemonic phrase
     */
    static validatePhrase(phrase: Phrase): boolean;
    /**
     * Sets a new phrase (Eg. If user wants to change wallet)
     */
    setPhrase(phrase: Phrase): boolean;
    /**
     * Validates an address
     */
    static validateAddress(address: Address): boolean;
    /**
     * Gets the eth balance of an address
     * @todo add start & end block parameters
     */
    getBalance(address?: Address): Promise<BigNumberish>;
    /**
     * Gets the erc20 asset balance of an address
     */
    getERC20Balance(asset: Address, address?: Address): Promise<BigNumberish>;
    /**
     * Gets the current block of the network
     */
    getBlockNumber(): Promise<number>;
    /**
     * Gets the transaction history of an address.
     */
    getTransactions(address?: Address): Promise<Array<TransactionResponse>>;
    /**
     * Sends a transaction to the vault
     */
    vaultTx(asset: Address, amount: BigNumberish, memo: string): Promise<TransactionResponse>;
    /**
     * Sends a transaction to the vault
     * @todo add from?: string, nonce: BigNumberish, gasLimit: BigNumberish, gasPrice: BigNumberish
     */
    normalTx(addressTo: Address, amount: BigNumberish): Promise<TransactionResponse>;
}
export {};
