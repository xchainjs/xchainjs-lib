import { Fees, Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

/**
 * Check Subscan API response
 *
 * @param {SubscanResponse} response The subscan response.
 * @returns {boolean} `true` or `false`
 */
export const isSuccess = (response: { code: number }): boolean => !response.code

/**
 * Get the decimal based on the network
 *
 * @param {Network} network The network.
 * @returns {number} The decimal based on the network.
 */
export const getDecimal = (network: Network): number => {
  return network === 'testnet' ? 12 : 10
}

/**
 * Get the default fees.
 *
 * @returns {Fees} The default fees based on the network.
 */
export const getDefaultFees = (network: Network): Fees => {
  const fee = assetToBase(assetAmount(0.015, getDecimal(network)))

  return {
    type: 'byte',
    fast: fee,
    fastest: fee,
    average: fee,
  }
}

/**
 * Get address prefix based on the network.
 *
 * @param {string} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: string) => (network === 'testnet' ? '5' : '1')
