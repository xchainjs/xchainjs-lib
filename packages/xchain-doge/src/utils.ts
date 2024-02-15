/**
 * Import statements for required modules and types.
 */
import { Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import * as Dogecoin from 'bitcoinjs-lib' // Importing bitcoinjs-lib for Dogecoin operations
import coininfo from 'coininfo' // Importing coininfo for cryptocurrency information retrieval

/**
 * Constant values representing transaction sizes and lengths.
 */
export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 // 10
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1 // 9
export const TX_OUTPUT_PUBKEYHASH = 25

/**
 * Calculate the number of bytes required for an input.
 *
 * @returns {number} The number of bytes required for an input.
 */
export function inputBytes(): number {
  return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH
}

/**
 * Calculate the average value of an array.
 *
 * @param {number[]} array - The array of numbers.
 * @returns {number} The average value of the array.
 */
export function arrayAverage(array: number[]): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Get the Dogecoin network configuration to be used with bitcoinjs.
 *
 * @param {Network} network - The network type.
 * @returns {Dogecoin.networks.Network} The Dogecoin network configuration.
 */
export const dogeNetwork = (network: Network): Dogecoin.networks.Network => {
  switch (network) {
    case Network.Mainnet:
      return coininfo.dogecoin.main.toBitcoinJS()
    case Network.Stagenet:
      return coininfo.dogecoin.main.toBitcoinJS()
    case Network.Testnet: {
      // Latest coininfo on NPM doesn't contain dogetest config information
      const bip32 = {
        private: 0x04358394,
        public: 0x043587cf,
      }
      const test = coininfo.dogecoin.test
      test.versions.bip32 = bip32
      return test.toBitcoinJS()
    }
  }
}

/**
 * Validate a Dogecoin address.
 *
 * @param {Address} address - The Dogecoin address to validate.
 * @param {Network} network - The network type.
 * @returns {boolean} `true` if the address is valid, `false` otherwise.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Dogecoin.address.toOutputScript(address, dogeNetwork(network))
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get the address prefix based on the network.
 *
 * @param {Network} network - The network type.
 * @returns {string} The address prefix based on the network.
 */
export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return ''
    case Network.Testnet:
      return 'n'
  }
}
