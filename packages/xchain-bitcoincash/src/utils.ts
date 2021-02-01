import * as bitcash from 'bitcore-lib-cash'
import { Network, Tx, TxFrom, TxTo } from '@xchainjs/xchain-client'
import { Asset, BCHChain, baseAmount } from '@xchainjs/xchain-util/lib'
import { DerivePath, Transaction } from './types'
import * as utils from './utils'

export const AssetBCH: Asset = { chain: BCHChain, symbol: 'BCH', ticker: 'BCH' }
export const BCH_DECIMAL = 8

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
 * @returns {} The BCH network.
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

/**
 * Parse transaction.
 *
 * @param {Transaction} tx
 * @returns {Tx} Parsed transaction.
 *
 **/
export const parseTransaction = (tx: Transaction): Tx => {
  return {
    asset: utils.AssetBCH,
    from: tx.inputs
      .filter((input) => !!input.address)
      .map(
        (input) =>
          ({
            from: input.address,
            amount: baseAmount(input.value, BCH_DECIMAL),
          } as TxFrom),
      ),
    to: tx.outputs
      .filter((output) => !!output.address)
      .map(
        (output) =>
          ({
            to: output.address,
            amount: baseAmount(output.value, BCH_DECIMAL),
          } as TxTo),
      ),
    date: new Date(tx.time * 1000),
    type: 'transfer',
    hash: tx.txid,
  }
}
