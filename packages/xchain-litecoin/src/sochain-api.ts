import axios from 'axios'
import {
  SochainResponse,
  LtcAddressUTXOs,
  LtcUnspentTxsDTO,
  LtcAddressDTO,
  LtcGetBalanceDTO,
  LtcBroadcastTransfer,
  ChainStatsLtc,
  Transaction,
  AddressParams,
  TxHashParams,
  TxBroadcastParams,
} from './types/sochain-api-types'
import { assetToBase, assetAmount, BaseAmount } from '@xchainjs/xchain-util'
import { LTC_DECIMAL } from './utils'

const toSochainNetwork = (net: string): string => {
  return net === 'testnet' ? 'LTCTEST' : 'LTC'
}

/**
 * Get address information.
 *
 * @see https://sochain.com/api#get-display-data-address
 *
 * @param {string} nodeUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {LtcAddressDTO}
 */
export const getAddress = async ({ nodeUrl, network, address }: AddressParams): Promise<LtcAddressDTO> => {
  try {
    const url = `${nodeUrl}/address/${toSochainNetwork(network)}/${address}`
    const response = await axios.get(url)
    const addressResponse: SochainResponse<LtcAddressDTO> = response.data
    return addressResponse.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get transaction by hash.
 *
 * @see https://sochain.com/api#get-tx
 *
 * @param {string} nodeUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ nodeUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  try {
    const url = `${nodeUrl}/get_tx/${toSochainNetwork(network)}/${hash}`
    const response = await axios.get(url)
    const tx: SochainResponse<Transaction> = response.data
    return tx.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get address balance.
 *
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} nodeUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {number}
 */
export const getBalance = async ({ nodeUrl, network, address }: AddressParams): Promise<BaseAmount> => {
  try {
    const url = `${nodeUrl}/get_address_balance/${toSochainNetwork(network)}/${address}`
    const response = await axios.get(url)
    const balanceResponse: SochainResponse<LtcGetBalanceDTO> = response.data
    const confirmed = assetAmount(balanceResponse.data.confirmed_balance, LTC_DECIMAL)
    const unconfirmed = assetAmount(balanceResponse.data.unconfirmed_balance, LTC_DECIMAL)
    const netAmt = confirmed.amount().plus(unconfirmed.amount())
    const result = assetToBase(assetAmount(netAmt, LTC_DECIMAL))
    return result
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get unspent txs
 *
 * @see https://sochain.com/api#get-unspent-tx
 *
 * @param {string} nodeUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {LtcAddressUTXOs}
 */
export const getUnspentTxs = async ({ nodeUrl, network, address }: AddressParams): Promise<LtcAddressUTXOs> => {
  try {
    const resp = await axios.get(`${nodeUrl}/get_tx_unspent/${toSochainNetwork(network)}/${address}`)
    const response: SochainResponse<LtcUnspentTxsDTO> = resp.data
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
 * @param {string} nodeUrl The sochain node url.
 * @param {string} network
 * @param {string} txHex
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ nodeUrl, network, txHex }: TxBroadcastParams): Promise<string> => {
  try {
    const url = `${nodeUrl}/send_tx/${toSochainNetwork(network)}`
    const data = { tx_hex: txHex }
    const response: SochainResponse<LtcBroadcastTransfer> = (await axios.post(url, data)).data
    return response.data.txid
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get Litecoin stats.
 *
 * @param {string} baseUrl The sochain node url.
 * @returns {ChainStatsLtc} The Litecoin stats.
 */
export const litecoinStats = async (): Promise<ChainStatsLtc> => {
  //Note: sochain does not provide fee rate related data
  //so this number is hardcoded here based on blockchair's litecoin value
  //Refer: https://api.blockchair.com/litecoin/stats
  const stats: ChainStatsLtc = {
    suggested_transaction_fee_per_byte_sat: 1,
  }

  return Promise.resolve(stats)
}
