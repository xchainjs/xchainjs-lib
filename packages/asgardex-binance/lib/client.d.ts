import { Address, MultiTransfer, Market, Network, TransferResult, Balances } from './types/binance';
/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
    init(): Promise<void>;
    setNetwork(net: Network): Promise<void>;
    getNetwork(): Network;
    getClientUrl(): string;
    getExplorerUrl(): string;
    getPrefix(): string;
    generatePhrase(): string;
    setPhrase(phrase?: string): void;
    validatePhrase(phrase: string): boolean;
    getAddress(): string;
    validateAddress(address: string): boolean;
    getBalance(address?: Address): Promise<Balances>;
    getTransactions(date: number, address?: string): Promise<any[]>;
    vaultTx(addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult>;
    normalTx(addressTo: Address, amount: number, asset: string): Promise<TransferResult>;
    getMarkets(limit?: number, offset?: number): Promise<Market>;
    multiSend(address: Address, transactions: MultiTransfer[], memo?: string): Promise<TransferResult>;
}
/**
 * Custom Binance client
 *
 * @example
 * ```
 * import { binance } from 'asgardex-common'
 *
 * # testnet
 * const client = await binance.client(binance.Network.TESTNET)
 * await client.transfer(...)
 * # mainnet
 * const client = await binance.client(binance.Network.MAINNET)
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
    constructor(_network?: Network, _phrase?: string);
    init: () => Promise<void>;
    setNetwork: (_network: Network) => Promise<void>;
    getNetwork(): Network;
    getClientUrl: () => string;
    getExplorerUrl: () => string;
    getPrefix: () => string;
    generatePhrase: () => string;
    setPhrase: (phrase?: string) => void;
    validatePhrase: (phrase: string) => boolean;
    getAddress: () => string;
    validateAddress: (address: Address) => boolean;
    getBalance: (address?: string | undefined) => Promise<Balances>;
    getTransactions: (date: number, address?: string | undefined) => Promise<any[]>;
    vaultTx: (addressTo: Address, amount: number, asset: string, memo: string) => Promise<TransferResult>;
    normalTx: (addressTo: Address, amount: number, asset: string) => Promise<TransferResult>;
    getMarkets: (limit?: number, offset?: number) => Promise<Market>;
    multiSend: (address: Address, transactions: MultiTransfer[], memo?: string) => Promise<TransferResult>;
}
export { Client };
