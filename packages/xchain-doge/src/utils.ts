import { Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import * as Dogecoin from 'bitcoinjs-lib'
import coininfo from 'coininfo'

export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1 //9
export const TX_OUTPUT_PUBKEYHASH = 25

export function inputBytes(): number {
  return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH
}

/**
 * Get the average value of an array.
 *
 * @param {number[]} array
 * @returns {number} The average value.
 */
export function arrayAverage(array: number[]): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Get Dogecoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Dogecoin.networks.Network} The Doge network.
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
 * Validate the Doge address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
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
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return ''
    case Network.Testnet:
      return 'n'
  }
}
