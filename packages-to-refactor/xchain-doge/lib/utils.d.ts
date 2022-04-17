/// <reference types="node" />
import { Address, Balance, FeeRate, Fees, FeesWithRates, Network, TxHash, TxParams } from '@xchainjs/xchain-client';
import { BaseAmount } from '@xchainjs/xchain-util';
import * as Dogecoin from 'bitcoinjs-lib';
import { BroadcastTxParams, UTXO } from './types/common';
/**
 * Compile memo.
 *
 * @param {string} memo The memo to be compiled.
 * @returns {Buffer} The compiled memo.
 */
export declare const compileMemo: (memo: string) => Buffer;
/**
 * Get the transaction fee.
 *
 * @param {UTXO[]} inputs The UTXOs.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {number} The fee amount.
 */
export declare function getFee(inputs: UTXO[], feeRate: FeeRate, data?: Buffer | null): number;
/**
 * Get the average value of an array.
 *
 * @param {number[]} array
 * @returns {number} The average value.
 */
export declare function arrayAverage(array: number[]): number;
/**
 * Get Dogecoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Dogecoin.networks.Network} The Doge network.
 */
export declare const dogeNetwork: (network: Network) => Dogecoin.networks.Network;
/**
 * Get the balances of an address.
 *
 * @param params
 * @returns {Balance[]} The balances of the given address.
 */
export declare const getBalance: (params: {
    sochainUrl: string;
    network: Network;
    address: string;
}) => Promise<Balance[]>;
/**
 * Validate the Doge address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export declare const validateAddress: (address: Address, network: Network) => boolean;
/**
 * Scan UTXOs from sochain.
 *
 * @param params
 * @returns {UTXO[]} The UTXOs of the given address.
 */
export declare const scanUTXOs: ({ sochainUrl, network, address, withTxHex, }: {
    sochainUrl: string;
    network: Network;
    address: string;
    withTxHex: boolean;
}) => Promise<UTXO[]>;
/**
 * Build transcation.
 *
 * @param {BuildParams} params The transaction build options.
 * @returns {Transaction}
 */
export declare const buildTx: ({ amount, recipient, memo, feeRate, sender, network, sochainUrl, withTxHex, }: TxParams & {
    feeRate: FeeRate;
    sender: Address;
    network: Network;
    sochainUrl: string;
    withTxHex?: boolean | undefined;
}) => Promise<{
    psbt: Dogecoin.Psbt;
    utxos: UTXO[];
}>;
/**
 * Broadcast the transaction.
 *
 * @param {BroadcastTxParams} params The transaction broadcast options.
 * @returns {TxHash} The transaction hash.
 */
export declare const broadcastTx: (params: BroadcastTxParams) => Promise<TxHash>;
/**
 * Calculate fees based on fee rate and memo.
 *
 * @param {FeeRate} feeRate
 * @param {string} memo
 * @returns {BaseAmount} The calculated fees based on fee rate and the memo.
 */
export declare const calcFee: (feeRate: FeeRate, memo?: string | undefined) => BaseAmount;
/**
 * Get the default fees with rates.
 *
 * @returns {FeesWithRates} The default fees and rates.
 */
export declare const getDefaultFeesWithRates: () => FeesWithRates;
/**
 * Get the default fees.
 *
 * @returns {Fees} The default fees.
 */
export declare const getDefaultFees: () => Fees;
/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export declare const getPrefix: (network: Network) => "" | "n";
