import { ethers } from 'ethers';
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider';
import { EtherscanProvider } from '@ethersproject/providers';
import { Network, Address, Phrase, NormalTxOpts, Erc20TxOpts, EstimateGasERC20Opts } from './types';
/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
    setNetwork(network: Network): Network;
    setPhrase(phrase?: string): void;
    getAddress(): string;
    getBalance(address: Address): Promise<ethers.BigNumberish>;
    getBlockNumber(): Promise<number>;
    getTransactionCount(blocktag: string | number): Promise<number>;
    getTransactions(address?: Address): Promise<Array<TransactionResponse>>;
    vaultTx(asset: string, amount: ethers.BigNumberish, memo: string): Promise<TransactionResponse>;
    estimateNormalTx(params: NormalTxOpts): Promise<ethers.BigNumberish>;
    normalTx(opts: NormalTxOpts): Promise<TransactionResponse>;
    estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<ethers.BigNumberish>;
    erc20Tx(opts: Erc20TxOpts): Promise<TransactionResponse>;
}
/**
 * Custom Ethereum client
 */
export default class Client implements EthereumClient {
    private _wallet;
    private _network;
    private _phrase;
    private _provider;
    private _address;
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
     * Returns a Promise that resovles to the number of transactions this account has ever sent (also called the nonce) at the blockTag.
     * @param blocktag A block tag is used to uniquely identify a block’s position in the blockchain:
     * a Number or hex string:
     * Each block has a block number (eg. 42 or "0x2a).
     * “latest”:
     *  The most recently mined block.
     * “pending”:
     *  The block that is currently being mined.
     */
    getTransactionCount(blocktag?: string | number, address?: Address): Promise<number>;
    /**
     * Gets the transaction history of an address.
     */
    getTransactions(address?: Address): Promise<Array<TransactionResponse>>;
    /**
     * Sends a transaction to the vault
     */
    vaultTx(asset: Address, amount: ethers.BigNumberish, memo: string): Promise<TransactionResponse>;
    /**
     * Returns the estimate gas for a normal transaction
     * @param params NormalTxOpts  transaction options
     */
    estimateNormalTx(params: NormalTxOpts): Promise<ethers.BigNumberish>;
    /**
     * Sends a transaction in ether
     */
    normalTx(params: NormalTxOpts): Promise<TransactionResponse>;
    /**
     * Returns a promise with the gas estimate to the function call `transfer` of a contract
     * that follows the ERC20 interfaces
     **/
    estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<ethers.BigNumberish>;
    /**
     * Returns a promise with the `TransactionResponse` of the erc20 transfer
     */
    erc20Tx(params: Erc20TxOpts): Promise<TransactionResponse>;
}
export { Client };
