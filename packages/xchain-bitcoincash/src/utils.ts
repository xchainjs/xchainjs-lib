import * as bitcash from 'bitcore-lib-cash'
import { Network } from '@xchainjs/xchain-client'
import { DerivePath } from './types'
import { Asset, BCHChain } from '@xchainjs/xchain-util/lib'

export const AssetBCH: Asset = { chain: BCHChain, symbol: 'BCH', ticker: 'BCH' }

/**
 * Get DerivePath.
 *
 * @param {number} index (optional)
 * @returns {DerivePath} The bitcoin derivation path by the index. (both mainnet and testnet)
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
 * Get Bitcoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {} The BTC network.
 */
export const bchNetwork = (network: Network): bitcash.Networks.Network => {
  return isTestnet(network) ? bitcash.Networks.testnet : bitcash.Networks.mainnet
}
