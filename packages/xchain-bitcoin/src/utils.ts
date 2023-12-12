import { Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { UTXO } from '@xchainjs/xchain-utxo'
import * as Bitcoin from 'bitcoinjs-lib'

export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1 //9
export const TX_OUTPUT_PUBKEYHASH = 25

export const inputBytes = (input: UTXO): number => {
  return TX_INPUT_BASE + (input.witnessUtxo?.script ? input.witnessUtxo?.script.length : TX_INPUT_PUBKEYHASH)
}

/**
 * Get the average value of an array.
 *
 * @param {number[]} array
 * @returns {number} The average value.
 */
export const arrayAverage = (array: number[]): number => {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Get Bitcoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Bitcoin.Network} The BTC network.
 */
export const btcNetwork = (network: Network): Bitcoin.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return Bitcoin.networks.bitcoin
    case Network.Testnet:
      return Bitcoin.networks.testnet
  }
}

/**
 * Validate the BTC address.
 *
 * @param {Address} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Bitcoin.address.toOutputScript(address, btcNetwork(network))
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
      return 'bc1'
    case Network.Testnet:
      return 'tb1'
  }
}
