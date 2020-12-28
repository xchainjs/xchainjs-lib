import { Fees, Network } from '@xchainjs/xchain-client/lib'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util/lib'

/**
 * Check Subscan API response
 */
export const isSuccess = (response: { code: number }): boolean => !response.code

export const getDecimal = (network: Network): number => {
  return network === 'testnet' ? 12 : 10
}

export const getDefaultFees = (network: Network): Fees => {
  const fee = assetToBase(assetAmount(0.015, getDecimal(network)))

  return {
    type: 'byte',
    fast: fee,
    fastest: fee,
    average: fee,
  }
}
