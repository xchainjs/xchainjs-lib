// Import statements for necessary modules and types
import { Network } from '@xchainjs/xchain-client' // Importing the Network type from xchain-client module
import { Address } from '@xchainjs/xchain-util' // Importing the Address type from xchain-util module
import { UTXO } from '@xchainjs/xchain-utxo' // Importing the UTXO type from xchain-utxo module
import * as Bitcoin from 'bitcoinjs-lib' // Importing the entire bitcoinjs-lib module and aliasing it as Bitcoin

// Constants defining the sizes of various components in a Bitcoin transaction
export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 // Total size of an empty transaction
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // Size of a base input in a transaction
export const TX_INPUT_PUBKEYHASH = 107 // Size of an input with a public key hash
export const TX_OUTPUT_BASE = 8 + 1 // Size of a base output in a transaction
export const TX_OUTPUT_PUBKEYHASH = 25 // Size of an output with a public key hash

/**
 * Function to calculate the size of an input in a transaction.
 * @param {UTXO} input - The UTXO (Unspent Transaction Output) for which to calculate the size.
 * @returns {number} The size of the input.
 */
export const inputBytes = (input: UTXO): number => {
  return TX_INPUT_BASE + (input.witnessUtxo?.script ? input.witnessUtxo?.script.length : TX_INPUT_PUBKEYHASH)
}

/**
 * Function to calculate the average value of an array of numbers.
 * @param {number[]} array - The array of numbers.
 * @returns {number} The average value of the array.
 */
export const arrayAverage = (array: number[]): number => {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Function to get the Bitcoin network to be used with bitcoinjs.
 *
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {Bitcoin.Network} The Bitcoin network.
 */
export const btcNetwork = (network: Network): Bitcoin.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return Bitcoin.networks.bitcoin // Return the Bitcoin mainnet or stagenet network
    case Network.Testnet:
      return Bitcoin.networks.testnet // Return the Bitcoin testnet network
  }
}

/**
 * Function to validate a Bitcoin address.
 * @param {Address} address - The Bitcoin address to validate.
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {boolean} `true` if the address is valid, `false` otherwise.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Bitcoin.address.toOutputScript(address, btcNetwork(network)) // Try to convert the address to an output script using the specified network
    return true // If successful, the address is valid
  } catch (error) {
    return false // If an error occurs, the address is invalid
  }
}

/**
 * Function to get the address prefix based on the network.
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {string} The address prefix based on the network.
 */
export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'bc1' // Return the address prefix for Bitcoin mainnet or stagenet
    case Network.Testnet:
      return 'tb1' // Return the address prefix for Bitcoin testnet
  }
}

/**
 * Converts a public key to an X-only public key.
 * @param pubKey The public key to convert.
 * @returns The X-only public key.
 */
export const toXOnly = (pubKey: Buffer): Buffer => (pubKey.length === 32 ? pubKey : pubKey.subarray(1, 33))
