import * as Bitcoin from 'bitcoinjs-lib';
import * as Utils from './utils';
import { Txs } from './types/electrs-api-types';
import { FeeOptions } from './types/client-types';
import { AsgardexClient, TxParams } from '@asgardex-clients/core';
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
    purgeClient(): void;
    setNetwork(net: Network): void;
    getNetwork(net: Network): Bitcoin.networks.Network;
    setBaseUrl(endpoint: string): void;
    getAddress(): string;
    validateAddress(address: string): boolean;
    scanUTXOs(): Promise<void>;
    calcFees(addressTo: string, memo?: string): Promise<FeeOptions>;
}
/**
 * Implements Client declared above
 */
declare class Client implements BitcoinClient, AsgardexClient {
    net: Network;
    phrase: string;
    electrsAPI: string;
    utxos: Utils.UTXO[];
    constructor(_net?: Network, _electrsAPI?: string, _phrase?: string);
    generatePhrase: () => string;
    setPhrase: (phrase?: string | undefined) => void;
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
    transfer: ({ amount, recipient, memo, feeRate }: TxParams) => Promise<string>;
}
export { Client, Network };
