import { Network, Tx, TxFrom, TxTo, TxType } from '@xchainjs/xchain-client'
import { Address, baseAmount } from '@xchainjs/xchain-util'
import * as bchaddr from 'bchaddrjs'
import coininfo from 'coininfo'

import { AssetBCH, BCH_DECIMAL } from './const'
import { Transaction, TransactionInput, TransactionOutput } from './types'
import { Network as BCHNetwork } from './types/bitcoincashjs-types'

export const DEFAULT_SUGGESTED_TRANSACTION_FEE = 1

export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1 //9
export const TX_OUTPUT_PUBKEYHASH = 25

/**
 * Get BCH network to be used with bitcore-lib.
 *
 * @param {Network} network
 * @returns {} The BCH network.
 */
export const bchNetwork = (network: Network): BCHNetwork => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return coininfo.bitcoincash.main.toBitcoinJS()
    case Network.Testnet:
      return coininfo.bitcoincash.test.toBitcoinJS()
  }
}

/**
 * BCH new addresses strategy has no any prefixes.
 * Any possible prefixes at the TX addresses will be stripped out with parseTransaction
 **/
export const getPrefix = () => ''

/**
 * Strips bchtest or bitcoincash prefix from address
 *
 * @param {Address} address
 * @returns {Address} The address with prefix removed
 *
 */
export const stripPrefix = (address: Address): Address => address.replace(/(bchtest:|bitcoincash:)/, '')

/**
 * Convert to Legacy Address.
 *
 * @param {Address} address
 * @returns {Address} Legacy address.
 */
export const toLegacyAddress = (address: Address): Address => {
  return bchaddr.toLegacyAddress(address)
}

/**
 * Convert to Cash Address.
 *
 * @param {Address} address
 * @returns {Address} Cash address.
 */
export const toCashAddress = (address: Address): Address => {
  return bchaddr.toCashAddress(address)
}

/**
 * Checks whether address is Cash Address
 *
 * @param {Address} address
 * @returns {boolean} Is cash address.
 */
export const isCashAddress = (address: Address): boolean => {
  return bchaddr.isCashAddress(address)
}

/**
 * Parse transaction.
 *
 * @param {Transaction} tx
 * @returns {Tx} Parsed transaction.
 *
 **/
export const parseTransaction = (tx: Transaction): Tx => {
  return {
    asset: AssetBCH,
    from: tx.inputs
      // For correct type inference `Array.prototype.filter` needs manual type guard to be defined
      .filter((input): input is Omit<TransactionInput, 'address'> & { address: string } => !!input.address)
      .map(
        (input) =>
          ({
            from: stripPrefix(input.address),
            amount: baseAmount(input.value, BCH_DECIMAL),
          } as TxFrom),
      ),
    to: tx.outputs
      // For correct type inference `Array.prototype.filter` needs manual type guard to be defined
      .filter((output): output is Omit<TransactionOutput, 'address'> & { address: string } => !!output.address)
      .map(
        (output) =>
          ({
            to: stripPrefix(output.address),
            amount: baseAmount(output.value, BCH_DECIMAL),
          } as TxTo),
      ),
    date: new Date(tx.time * 1000),
    type: TxType.Transfer,
    hash: tx.txid,
  }
}

/**
 * Converts `Network` to `bchaddr.Network`
 *
 * @param {Network} network
 * @returns {string} bchaddr network
 */
export const toBCHAddressNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return bchaddr.Network.Mainnet
    case Network.Testnet:
      return bchaddr.Network.Testnet
  }
}

/**
 * Validate the BCH address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export const validateAddress = (address: string, network: Network): boolean => {
  const toAddress = toCashAddress(address)
  return bchaddr.isValidAddress(toAddress) && bchaddr.detectAddressNetwork(toAddress) === toBCHAddressNetwork(network)
}
