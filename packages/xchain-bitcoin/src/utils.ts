// Import statements for necessary modules and types
import { PairingInfo } from '@keepkey/keepkey-sdk' // Importing pairing info from keepKey
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
 * KeepKey configs
 */

export type Config = {
  apiKey: string
  pairingInfo: PairingInfo
}

/*
   UXTO
 */

export enum BTCOutputScriptType {
  PayToAddress = 'p2pkh',
  PayToMultisig = 'p2sh',
  Bech32 = 'bech32',
  PayToWitness = 'p2wpkh',
  PayToP2SHWitness = 'p2sh-p2wpkh',
}

/**
 * bip32 utils
 */
const HARDENED = 0x80000000

export const addressNListToBIP32 = (address: number[]): string => {
  return `m/${address.map((num) => (num >= HARDENED ? `${num - HARDENED}'` : num)).join('/')}`
}

export const bip32Like = (path: string): boolean => {
  if (path === 'm/') return true
  return /^m(((\/[0-9]+h)+|(\/[0-9]+H)+|(\/[0-9]+')*)((\/[0-9]+)*))$/.test(path)
}

export const bip32ToAddressNList = (path: string): number[] => {
  if (!bip32Like(path)) {
    throw new Error(`Not a bip32 path: '${path}'`)
  }
  if (/^m\//i.test(path)) {
    path = path.slice(2)
  }
  const segments = path.split('/')
  if (segments.length === 1 && segments[0] === '') return []
  const ret = new Array(segments.length)
  for (let i = 0; i < segments.length; i++) {
    const tmp = /(\d+)([hH']?)/.exec(segments[i])
    if (tmp === null) {
      throw new Error('Invalid input')
    }
    ret[i] = parseInt(tmp[1], 10)
    if (ret[i] >= HARDENED) {
      throw new Error('Invalid child index')
    }
    if (tmp[2] === 'h' || tmp[2] === 'H' || tmp[2] === "'") {
      ret[i] += HARDENED
    } else if (tmp[2].length !== 0) {
      throw new Error('Invalid modifier')
    }
  }
  return ret
}
