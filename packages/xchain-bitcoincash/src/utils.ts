/**
 * Module importing and providing utilities for Bitcoin Cash (BCH) transactions and addresses.
 */
import { Network, TxType } from '@xchainjs/xchain-client' // Importing types related to network and transactions
import { Address, baseAmount } from '@xchainjs/xchain-util' // Importing utilities related to addresses and amounts
import { Tx, TxFrom, TxTo, toBitcoinJS } from '@xchainjs/xchain-utxo' // Importing Bitcoin Cash address utilities
import * as bchaddr from 'bchaddrjs' // Importing coin information utility

import { AssetBCH, BCH_DECIMAL } from './const' // Importing BCH asset and decimal constants
import { Transaction, TransactionInput, TransactionOutput } from './types' // Importing custom transaction types
import { Network as BCHNetwork } from './types/bitcoincashjs-types' // Importing custom network type

/**
 * Size constants for BCH transactions.
 */
export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4
export const TX_INPUT_BASE = 32 + 4 + 1 + 4
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1
export const TX_OUTPUT_PUBKEYHASH = 25

/**
 * Retrieves the BCH network to be used with bitcore-lib.
 * @param {Network} network The network type.
 * @returns {BCHNetwork} The BCH network.
 */
export const bchNetwork = (network: Network): BCHNetwork => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return toBitcoinJS('bitcoincash', 'main') as BCHNetwork
    case Network.Testnet:
      return toBitcoinJS('bitcoincash', 'test') as BCHNetwork
  }
}

/**
 * Retrieves the BCH address prefix.
 *
 * @returns {string} The BCH address prefix.
 */
export const getPrefix = (): string => ''

/**
 * Strips the BCH address prefix.
 * @param {Address} address The BCH address.
 * @returns {Address} The address with the prefix removed.
 */
export const stripPrefix = (address: Address): Address => address.replace(/(bchtest:|bitcoincash:)/, '')

/**
 * Converts the BCH address to a legacy address format.
 * @param {Address} address The BCH address.
 * @returns {Address} The legacy address.
 */
export const toLegacyAddress = (address: Address): Address => {
  return bchaddr.toLegacyAddress(address)
}

/**
 * Converts the BCH address to a cash address format.
 * @param {Address} address The BCH address.
 * @returns {Address} The cash address.
 */
export const toCashAddress = (address: Address): Address => {
  return bchaddr.toCashAddress(address)
}

/**
 * Checks whether the address is a cash address.
 * @param {Address} address The BCH address.
 * @returns {boolean} Whether the address is a cash address.
 */
export const isCashAddress = (address: Address): boolean => {
  return bchaddr.isCashAddress(address)
}

/**
 * Parses a BCH transaction.
 * @param {Transaction} tx The BCH transaction.
 * @returns {Tx} The parsed transaction.
 */
export const parseTransaction = (tx: Transaction): Tx => {
  return {
    asset: AssetBCH,
    from: tx.inputs
      .filter((input): input is Omit<TransactionInput, 'address'> & { address: string } => !!input.address)
      .map(
        (input) =>
          ({
            from: stripPrefix(input.address),
            amount: baseAmount(input.value, BCH_DECIMAL),
          } as TxFrom),
      ),
    to: tx.outputs
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
 * Converts the XChain network to a BCH address network.
 * @param {Network} network The XChain network.
 * @returns {string} The BCH address network.
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
 * Validates the BCH address.
 * @param {string} address The BCH address.
 * @param {Network} network The XChain network.
 * @returns {boolean} Whether the address is valid.
 */
export const validateAddress = (address: string, network: Network): boolean => {
  const toAddress = toCashAddress(address)
  return bchaddr.isValidAddress(toAddress) && bchaddr.detectAddressNetwork(toAddress) === toBCHAddressNetwork(network)
}
