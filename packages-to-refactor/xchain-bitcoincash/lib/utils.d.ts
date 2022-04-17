/// <reference types="node" />
import { Address, Balance, FeeRate, Fees, FeesWithRates, Network, Tx, TxHash, TxParams } from '@xchainjs/xchain-client';
import { BaseAmount } from '@xchainjs/xchain-util';
import { AddressParams, BroadcastTxParams, Transaction, UTXO } from './types';
import { Network as BCHNetwork, TransactionBuilder } from './types/bitcoincashjs-types';
export declare const BCH_DECIMAL = 8;
export declare const DEFAULT_SUGGESTED_TRANSACTION_FEE = 1;
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
 * reference to https://github.com/Permissionless-Software-Foundation/bch-js/blob/acc0300a444059d612daec2564da743c11e27139/src/bitcoincash.js#L408
 *
 * @param {number} inputs The inputs count.
 * @param {number} outputs The outputs count.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {number} The fee amount.
 */
export declare function getFee(inputs: number, feeRate: FeeRate, data?: Buffer | null): number;
/**
 * Get the balances of an address.
 *
 * @param {AddressParams} params
 * @returns {Balance[]} The balances of the given address.
 */
export declare const getBalance: (params: AddressParams) => Promise<Balance[]>;
/**
 * Get BCH network to be used with bitcore-lib.
 *
 * @param {Network} network
 * @returns {} The BCH network.
 */
export declare const bchNetwork: (network: Network) => BCHNetwork;
/**
 * BCH new addresses strategy has no any prefixes.
 * Any possible prefixes at the TX addresses will be stripped out with parseTransaction
 **/
export declare const getPrefix: () => string;
/**
 * Strips bchtest or bitcoincash prefix from address
 *
 * @param {Address} address
 * @returns {Address} The address with prefix removed
 *
 */
export declare const stripPrefix: (address: Address) => Address;
/**
 * Convert to Legacy Address.
 *
 * @param {Address} address
 * @returns {Address} Legacy address.
 */
export declare const toLegacyAddress: (address: Address) => Address;
/**
 * Convert to Cash Address.
 *
 * @param {Address} address
 * @returns {Address} Cash address.
 */
export declare const toCashAddress: (address: Address) => Address;
/**
 * Checks whether address is Cash Address
 *
 * @param {Address} address
 * @returns {boolean} Is cash address.
 */
export declare const isCashAddress: (address: Address) => boolean;
/**
 * Parse transaction.
 *
 * @param {Transaction} tx
 * @returns {Tx} Parsed transaction.
 *
 **/
export declare const parseTransaction: (tx: Transaction) => Tx;
/**
 * Converts `Network` to `bchaddr.Network`
 *
 * @param {Network} network
 * @returns {string} bchaddr network
 */
export declare const toBCHAddressNetwork: (network: Network) => string;
/**
 * Validate the BCH address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export declare const validateAddress: (address: string, network: Network) => boolean;
/**
 * Scan UTXOs from sochain.
 *
 * @param {string} haskoinUrl sochain Node URL.
 * @param {Address} address
 * @returns {UTXO[]} The UTXOs of the given address.
 */
export declare const scanUTXOs: ({ haskoinUrl, address }: {
    haskoinUrl: string;
    address: Address;
}) => Promise<UTXO[]>;
/**
 * Build transcation.
 *
 * @param {BuildParams} params The transaction build options.
 * @returns {Transaction}
 */
export declare const buildTx: ({ amount, recipient, memo, feeRate, sender, network, haskoinUrl, }: TxParams & {
    feeRate: FeeRate;
    sender: Address;
    network: Network;
    haskoinUrl: string;
}) => Promise<{
    builder: TransactionBuilder;
    utxos: UTXO[];
    inputs: UTXO[];
}>;
/**
 * Broadcast the transaction.
 *
 * @param {BroadcastTxParams} params The transaction broadcast options.
 * @returns {TxHash} The transaction hash.
 */
export declare const broadcastTx: ({ haskoinUrl, txHex }: BroadcastTxParams) => Promise<TxHash>;
/**
 * Calculate fees based on fee rate and memo.
 *
 * @param {FeeRate} feeRate
 * @param {string} memo (optional)
 * @param {UnspentOutput} utxos (optional)
 * @returns {BaseAmount} The calculated fees based on fee rate and the memo.
 */
export declare const calcFee: (feeRate: FeeRate, memo?: string | undefined, utxos?: UTXO[]) => BaseAmount;
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
