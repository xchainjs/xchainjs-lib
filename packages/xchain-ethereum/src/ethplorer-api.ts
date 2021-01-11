import axios from 'axios'
import { AddressInfo, TransactionInfo, TransactionOperation } from './types'

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

/**
 * Get ETH transactions.
 *
 * @see https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API#get-address-transactions
 *
 * @param {string} baseUrl The ethplorer api url.
 * @param {string} address The transaction hash.
 * @param {number} limit The maximum number of transactions.
 * @param {number} timestamp The start timestamp.
 * @param {string} apiKey The ethplorer API key. (optional)
 * @returns {Transactions} The transaction result.
 */
export const getAddressTransactions = async (
  baseUrl: string,
  address: string,
  limit?: number,
  timestamp?: number,
  apiKey?: string,
): Promise<TransactionInfo[]> => {
  try {
    const response = await axios.get(`${baseUrl}/getAddressTransactions/${address}`, {
      params: {
        apiKey: apiKey || 'freekey',
        limit,
        timestamp,
        showZeroValues: true,
      },
    })
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get token transactions.
 *
 * @see https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API#get-last-address-operations
 *
 * @param {string} baseUrl The ethplorer api url.
 * @param {string} address The transaction hash.
 * @param {string} token The token address.
 * @param {number} limit The maximum number of transactions.
 * @param {number} timestamp The start timestamp.
 * @param {string} apiKey The ethplorer API key. (optional)
 * @returns {Transactions} The transaction result.
 */
export const getAddressHistory = async (
  baseUrl: string,
  address: string,
  token: string,
  limit?: number,
  timestamp?: number,
  apiKey?: string,
): Promise<TransactionOperation[]> => {
  try {
    const response = await axios.get(`${baseUrl}/getAddressHistory/${address}`, {
      params: {
        apiKey: apiKey || 'freekey',
        token,
        limit,
        timestamp,
        showZeroValues: true,
        type: 'transfer',
      },
    })
    return response.data.operations
  } catch (error) {
    return Promise.reject(error)
  }
}
