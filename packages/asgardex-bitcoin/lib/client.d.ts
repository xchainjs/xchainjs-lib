import * as Bitcoin from 'bitcoinjs-lib';
import * as Utils from './utils';
import { Txs } from './types/electrs-api-types';
import { FeeOptions } from './types/client-types';
/**
 * Class variables accessed across functions
 */
declare enum Network {
    TEST = "testnet",
    MAIN = "mainnet"
}
/**
 * BitcoinClient Interface. Potentially to become AsgardClient
 */
interface BitcoinClient {
    generatePhrase(): string;
    setPhrase(phrase?: string): void;
    validatePhrase(phrase: string): boolean;
    purgeClient(): void;
    setNetwork(net: Network): void;
    getNetwork(net: Network): Bitcoin.networks.Network;
    setBaseUrl(endpoint: string): void;
    getAddress(): string;
    validateAddress(address: string): boolean;
    scanUTXOs(): Promise<void>;
    getBalance(): number;
    getBalanceForAddress(address?: string): Promise<number>;
    getTransactions(address: string): Promise<Txs>;
    getBlockTime(): Promise<number>;
    calcFees(memo?: string): Promise<object>;
    vaultTx(addressVault: string, valueOut: number, memo: string, feeRate: number): Promise<string>;
    normalTx(addressTo: string, valueOut: number, feeRate: number): Promise<string>;
}
/**
 * Implements Client declared above
 */
declare class Client implements BitcoinClient {
    net: Network;
    phrase: string;
    electrsAPI: string;
    utxos: Utils.UTXO[];
    constructor(_net?: Network, _electrsAPI?: string, _phrase?: string);
    generatePhrase: () => string;
    setPhrase: (phrase?: string | undefined) => void;
    validatePhrase(phrase: string): boolean;
    purgeClient: () => void;
    setNetwork(_net: Network): void;
    getNetwork(net: Network): Bitcoin.networks.Network;
    setBaseUrl(endpoint: string): void;
    getAddress: () => string;
    private getBtcKeys;
    validateAddress: (address: string) => boolean;
    scanUTXOs: () => Promise<void>;
    getBalance: () => number;
    getBalanceForAddress: (address: string) => Promise<number>;
    private getChange;
    getTransactions: (address: string) => Promise<Txs>;
    getBlockTime: () => Promise<number>;
    getTxWeight: (addressTo: string, valueOut: number, memo?: string | undefined) => Promise<number>;
    calcFees: (memo?: string | undefined) => Promise<FeeOptions>;
    vaultTx: (addressVault: string, valueOut: number, memo: string, feeRate: number) => Promise<string>;
    normalTx: (addressTo: string, valueOut: number, feeRate: number) => Promise<string>;
}
export { Client, Network };
