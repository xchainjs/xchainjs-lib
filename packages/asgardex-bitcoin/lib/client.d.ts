import * as Bitcoin from 'bitcoinjs-lib';
import * as Utils from './utils';
import { Txs } from './types/electrs-api-types';
import { FeeOptions, NormalTxParams, VaultTxParams } from './types/client-types';
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
    getExplorerUrl(): string;
    setBaseUrl(endpoint: string): void;
    getAddress(): string;
    validateAddress(address: string): boolean;
    scanUTXOs(): Promise<void>;
    getBalance(): Promise<number>;
    getBalanceForAddress(address?: string): Promise<number>;
    getTransactions(address: string): Promise<Txs>;
    calcFees(addressTo: string, memo?: string): Promise<FeeOptions>;
    vaultTx(params: VaultTxParams): Promise<string>;
    normalTx(params: NormalTxParams): Promise<string>;
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
    getExplorerUrl: () => string;
    getAddress: () => string;
    private getBtcKeys;
    validateAddress: (address: string) => boolean;
    scanUTXOs: () => Promise<void>;
    getBalance: () => Promise<number>;
    getBalanceForAddress: (address: string) => Promise<number>;
    private getChange;
    getTransactions: (address: string) => Promise<Txs>;
    calcFees: (memo?: string | undefined) => Promise<FeeOptions>;
    vaultTx: ({ addressTo, amount, feeRate, memo }: VaultTxParams) => Promise<string>;
    normalTx: ({ addressTo, amount, feeRate }: NormalTxParams) => Promise<string>;
}
export { Client, Network };
