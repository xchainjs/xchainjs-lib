import axios from 'axios'
import { AddressInfo } from './types'

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
