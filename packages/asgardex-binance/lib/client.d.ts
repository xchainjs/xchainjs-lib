import { Address, MultiTransfer, Network, TransferResult, Balances, Prefix } from './types/binance';
/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
    setNetwork(net: Network): BinanceClient;
    getNetwork(): Network;
    getClientUrl(): string;
    getExplorerUrl(): string;
    getPrefix(): Prefix;
    setPhrase(phrase?: string): BinanceClient;
    getAddress(): string;
    validateAddress(address: string): boolean;
    getBalance(address?: Address): Promise<Balances>;
    getTransactions(date: number, address?: string): Promise<any[]>;
    vaultTx(addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult>;
    normalTx(addressTo: Address, amount: number, asset: string): Promise<TransferResult>;
    getMarkets(limit?: number, offset?: number): Promise<any>;
    multiSend(address: Address, transactions: MultiTransfer[], memo?: string): Promise<TransferResult>;
}
/**
 * Custom Binance client
 *
 * @example
 * ```
 * import { Client as BinanceClient } from '@thorchain/asgardex-binance'
 *
 * # testnet (by default)
 * const client = new BinanceClient('any BIP39 mnemonic')
 * await client.transfer(...)
 * # mainnet
 * const client = await binance.client('any BIP39 mnemonic', Network.MAINNET)
 * await client.transfer(...)
 *
 * ```
 *
 * @class Binance
 * @implements {BinanceClient}
 */
declare class Client implements BinanceClient {
    private network;
    private bncClient;
    private phrase;
    private address;
    private privateKey;
    private dirtyPrivateKey;
    /**
     * Client has to be initialised with network type and phrase
     * It will throw an error if an invalid phrase has been passed
     **/
    constructor(phrase: string, network?: Network);
    setNetwork(network: Network): BinanceClient;
    getNetwork(): Network;
    getClientUrl: () => string;
    getExplorerUrl: () => string;
    getPrefix: () => Prefix;
    static generatePhrase: () => string;
    setPhrase: (phrase: string) => BinanceClient;
    static validatePhrase: (phrase: string) => boolean;
    private getPrivateKey;
    private setPrivateKey;
    getAddress: () => string;
    validateAddress: (address: Address) => boolean;
    getBalance: (address?: string | undefined) => Promise<Balances>;
    getTransactions: (date: number, address?: string | undefined) => Promise<any[]>;
    vaultTx: (addressTo: Address, amount: number, asset: string, memo: string) => Promise<TransferResult>;
    normalTx: (addressTo: Address, amount: number, asset: string) => Promise<TransferResult>;
    getMarkets: (limit?: number, offset?: number) => Promise<never[] | {
        result: any;
        status: number;
    }>;
    multiSend: (address: Address, transactions: MultiTransfer[], memo?: string) => Promise<{
        result: any;
        status: number;
    }>;
}
export { Client };
