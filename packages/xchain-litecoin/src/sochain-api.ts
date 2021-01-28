import axios from 'axios'
import { SochainResponse, LtcAddressUTXOs, LtcUnspentTxsDTO, ChainStatsLtc } from './types/sochain-api-types'
import { bn } from 'xchainjs-util'

/**
 * Get address balance.
 *
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} baseUrl The blockchair node url.
 * @param {string} network
 * @param {string} address
 * @returns {number}
 */
export const getBalance = async (baseUrl: string, network: string, address: string): Promise<number> => {
  try {
    const response = await axios.get(`${baseUrl}/get_address_balance/${network}/${address}`)
    const balanceResponse: SochainResponse<LtcGetBalanceDTO> = response.data
    return bn(balanceResponse.data.confirmed_balance).toNumber()
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get unspent txs
 *
 * @see https://sochain.com/api#get-unspent-tx
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {LtcAddressUTXOs}
 */
export const getUnspentTxs = async (baseUrl: string, network: string, address: string): Promise<LtcAddressUTXOs> => {
  try {
    const response = await axios.get(`${baseUrl}/get_tx_unspent/${network}/${address}`)
    const response: SochainResponse<LtcUnspentTxsDTO> = response.data
    return response.data.txs
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Broadcast transaction.
 *
 * @see https://sochain.com/api#send-transaction
 *
 * @param {string} baseUrl The blockchair node url.
 * @param {string} network
 * @param {string} txHex
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async (baseUrl: string, network: string, txHex: string): Promise<string> => {
  try {
    const response = await axios.post(`${baseUrl}/send_tx/${network}`, { data: { tx_hex: txHex } })
    return response.data.txid
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get Litecoin stats.
 *
 * @param {string} baseUrl The blockchair node url.
 * @returns {ChainStatsLtc} The Litecoin stats.
 */
export const litecoinStats = async (): Promise<ChainStatsLtc> => {
  //Note: sochain does not provide fee rate related data
  //so this number is hardcoded here based on blockchair's litecoin number
  //Refer: https://api.blockchair.com/litecoin/stats
  const stats: ChainStatsLtc = {
    suggested_transaction_fee_per_byte_sat: 1,
  }

  return Promise.resolve(stats)
}
