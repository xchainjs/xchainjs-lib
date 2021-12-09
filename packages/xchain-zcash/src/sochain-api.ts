import { Network } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import { AddressParams, SochainResponse, ZecAddressDTO, ZecGetBalanceDTO } from './types/sochain-api-types'
import { ZEC_DECIMAL } from './utils'

// const DEFAULT_SUGGESTED_TRANSACTION_FEE = 0.1

const toSochainNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
      return 'ZEC'
    case Network.Testnet:
      return 'ZECTEST'
  }
}

/**
 * Get address balance.
 *
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {number}
 */
export const getBalance = async ({ sochainUrl, network, address }: AddressParams): Promise<BaseAmount> => {
  const url = `${sochainUrl}/get_address_balance/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url)
  const balanceResponse: SochainResponse<ZecGetBalanceDTO> = response.data
  const confirmed = assetAmount(balanceResponse.data.confirmed_balance, ZEC_DECIMAL)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed_balance, ZEC_DECIMAL)
  const netAmt = confirmed.amount().plus(unconfirmed.amount())
  const result = assetToBase(assetAmount(netAmt, ZEC_DECIMAL))
  return result
}
/**
 * Get address information.
 *
 * @see https://sochain.com/api#get-display-data-address
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {LtcAddressDTO}
 */
export const getAddress = async ({ sochainUrl, network, address }: AddressParams): Promise<ZecAddressDTO> => {
  const url = `${sochainUrl}/address/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url)
  const addressResponse: SochainResponse<ZecAddressDTO> = response.data
  return addressResponse.data
}
