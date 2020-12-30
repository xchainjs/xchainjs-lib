import axios from 'axios'
import { BlockChairResponse, BtcAddressDTO, Transactions, RawTxsBTC, ChainStatsBtc } from './types/blockchair-api-types'

/**
 * Set Api key params.
 *
 * @param {string} key (optional) The API key.
 * @returns {Params}
 */
const setApiKeyParams = (key?: string) => {
  return key && key.length > 0 ? { params: { key: key } } : {}
}

/**
 * Get transaction by hash.
 *
 * @see https://blockchair.com/api/docs#link_200
 *
 * @param {string} baseUrl The blockchair node url.
 * @param {string} hash The transaction hash.
 * @param {string} apiKey (optional) The blockchair API key.
 * @returns {Transactions}
 */
export const getTx = async (baseUrl: string, hash: string, apiKey?: string): Promise<Transactions> => {
  try {
    // const response = await axios.get(`https://api.blockchair.com/${chain}/dashboards/transaction/${hash}`)
    const response = await axios.get(`${baseUrl}/dashboards/transaction/${hash}`, setApiKeyParams(apiKey))
    const txs: BlockChairResponse<Transactions> = response.data
    return txs.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get raw transaction by hash.
 *
 * @see https://blockchair.com/api/docs#link_201
 *
 * @param {string} baseUrl The blockchair node url.
 * @param {string} hash The transaction hash.
 * @param {string} apiKey (optional) The blockchair API key.
 * @returns {RawTxsBTC}
 */
export const getRawTx = async (baseUrl: string, hash: string, apiKey?: string): Promise<RawTxsBTC> => {
  try {
    const response = await axios.get(`${baseUrl}/raw/transaction/${hash}`, setApiKeyParams(apiKey))
    const txs: BlockChairResponse<RawTxsBTC> = response.data
    return txs.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get address information.
 *
 * @see https://blockchair.com/api/docs#link_300
 *
 * @param {string} baseUrl The blockchair node url.
 * @param {string} address
 * @param {string} apiKey (optional) The blockchair API key.
 * @param {number} limit (optional)
 * @param {number} offset (optional)
 * @returns {BtcAddressDTO}
 */
export const getAddress = async (
  baseUrl: string,
  address: string,
  apiKey?: string,
  limit?: number,
  offset?: number,
): Promise<BtcAddressDTO> => {
  try {
    const params: { [key: string]: string | number } = {}
    if (apiKey) params.key = apiKey
    if (limit) {
      if (limit > 10000) throw new Error('Max limit allowed 10000')
      params.limit = limit
    }
    if (offset) {
      if (offset > 1000000) throw new Error('Max offset allowed 1000000')
      params.offset = offset
    }

    const response = await axios.get(`${baseUrl}/dashboards/address/${address}`, { params })
    const addressResponse: BlockChairResponse<BtcAddressDTO> = response.data
    return addressResponse.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Broadcast transaction.
 *
 * @see https://blockchair.com/api/docs#link_202
 *
 * @param {string} baseUrl The blockchair node url.
 * @param {string} txHex
 * @param {string} apiKey (optional) The blockchair API key.
 * @returns {string} Transaction hash.
 */
export const broadcastTx = async (baseUrl: string, txHex: string, apiKey?: string): Promise<string> => {
  try {
    const response = await axios.post(`${baseUrl}/push/transaction`, { data: txHex }, setApiKeyParams(apiKey))
    return response.data.data.transaction_hash
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get Bitcoin stats.
 *
 * @see https://blockchair.com/api/docs#link_001
 *
 * @param {string} baseUrl The blockchair node url.
 * @param {string} apiKey (optional) The blockchair API key.
 * @returns {ChainStatsBtc} The Bitcoin stats.
 */
export const bitcoinStats = async (baseUrl: string, apiKey?: string): Promise<ChainStatsBtc> => {
  try {
    const response = await axios.get(`${baseUrl}/stats`, setApiKeyParams(apiKey))
    const bcRes: BlockChairResponse<ChainStatsBtc> = response.data
    return bcRes.data
  } catch (error) {
    return Promise.reject(error)
  }
}
