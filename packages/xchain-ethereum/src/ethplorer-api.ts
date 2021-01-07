import axios from 'axios'
import { AddressInfo, TransactionInfo } from './types'

/**
 * Get address information.
 *
 * @see https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API#get-address-info
 *
 * @param {string} baseUrl The ethplorer api url.
 * @param {string} address
 * @param {string} apiKey The ethplorer API key. (optional)
 * @returns {AddressInfo} The address information.
 */
export const getAddress = async (baseUrl: string, address: string, apiKey?: string): Promise<AddressInfo> => {
  try {
    const response = await axios.get(`${baseUrl}/getAddressInfo/${address}`, {
      params: {
        apiKey: apiKey || 'freekey',
      },
    })
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get transaction by hash.
 *
 * @see https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API#get-transaction-info
 *
 * @param {string} baseUrl The ethplorer api url.
 * @param {string} hash The transaction hash.
 * @param {string} apiKey The ethplorer API key. (optional)
 * @returns {Transactions} The transaction result.
 */
export const getTxInfo = async (baseUrl: string, hash: string, apiKey?: string): Promise<TransactionInfo> => {
  try {
    const response = await axios.get(`${baseUrl}/getTxInfo/${hash}`, {
      params: {
        apiKey: apiKey || 'freekey',
      },
    })
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}
