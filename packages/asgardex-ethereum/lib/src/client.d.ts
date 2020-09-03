import { ethers } from 'ethers';
import { Provider, TransactionResponse } from "@ethersproject/abstract-provider";
import { EtherscanProvider } from "@ethersproject/providers";
import { Network, Address, Phrase } from './types';
/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
    setNetwork(network: Network): Network;
    setPhrase(phrase?: string): void;
    getAddress(): string;
    getBalance(address: Address): Promise<ethers.BigNumberish>;
    getBlockNumber(): Promise<number>;
    getTransactions(address?: Address): Promise<Array<TransactionResponse>>;
    vaultTx(asset: string, amount: ethers.BigNumberish, memo: string): Promise<TransactionResponse>;
    normalTx(addressTo: Address, amount: ethers.BigNumberish, asset: string): Promise<TransactionResponse>;
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
    getAddress(): Address;
    get wallet(): ethers.Wallet;
    get vault(): ethers.Contract | null;
    get network(): Network;
    get provider(): Provider;
    get balance(): ethers.BigNumberish;
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
    init(): ethers.Wallet;
    /**
     * Set's the current network
     */
    setNetwork(network: Network): Network;
    /**
     * Set's the current vault contract
     */
    setVault(vault: string): ethers.Contract;
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
    getBalance(address?: Address): Promise<ethers.BigNumberish>;
    /**
     * Gets the erc20 asset balance of an address
     */
    getERC20Balance(asset: Address, address?: Address): Promise<ethers.BigNumberish>;
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
    vaultTx(asset: Address, amount: ethers.BigNumberish, memo: string): Promise<TransactionResponse>;
    /**
     * Sends a transaction to the vault
     * @todo add from?: string, nonce: BigNumberish, gasLimit: BigNumberish, gasPrice: BigNumberish
     */
    normalTx(addressTo: Address, amount: ethers.BigNumberish): Promise<TransactionResponse>;
}
export { Client };
