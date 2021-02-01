import * as bitcash from 'bitcore-lib-cash'
import { Network } from '@xchainjs/xchain-client'
import { DerivePath } from './types'
import { Asset, BCHChain } from '@xchainjs/xchain-util/lib'

export const AssetBCH: Asset = { chain: BCHChain, symbol: 'BCH', ticker: 'BCH' }

/**
 * Get DerivePath.
 *
 * @param {number} index (optional)
 * @returns {DerivePath} The bitcoin cash derivation path by the index. (both mainnet and testnet)
 */
export const getDerivePath = (index = 0): DerivePath => ({
  mainnet: `m/84'/145'/0'/0/${index}`,
  testnet: `m/84'/1'/0'/0/${index}`,
})

/**
 * Check if give network is a testnet.
 *
 * @param {Network} network
 * @returns {boolean} `true` or `false`
 */
export const isTestnet = (network: Network): boolean => {
  return network === 'testnet'
}

/**
 * Get BCH network to be used with bitcore-lib.
 *
 * @param {Network} network
 * @returns {} The BCh network.
 */
export const bchNetwork = (network: Network): bitcash.Networks.Network => {
  return isTestnet(network) ? bitcash.Networks.testnet : bitcash.Networks.mainnet
}

/**
 * Get address prefix based on the network.
 *
 * @param {string} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: string) => (network === 'testnet' ? 'bchtest:' : 'bitcoincash:')

/**
 * Decode BCH address.
 *
 * @param {string} address
 * @returns {string} Decoded BCH address.
 *
 **/
export const decodeAddress = (address: string, network: string): string => {
  const prefix = getPrefix(network)
  if (address.startsWith(prefix)) {
    return address.substring(prefix.length, address.length)
  }

  return address
}

/**
 * Encode BCH address.
 *
 * @param {string} address
 * @returns {string} Encoded BCH address.
 *
 **/
export const encodeAddress = (address: string, network: string): string => {
  const prefix = getPrefix(network)
  if (address.startsWith(prefix)) {
    return address
  }

  return getPrefix(network) + address
}
