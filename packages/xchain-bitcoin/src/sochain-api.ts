import axios from 'axios'
import {
  SochainResponse,
  BtcAddressUTXOs,
  BtcUnspentTxsDTO,
  BtcAddressDTO,
  BtcGetBalanceDTO,
  BtcBroadcastTransfer,
  Transaction,
  AddressParams,
  TxHashParams,
  TxBroadcastParams,
} from './types/sochain-api-types'
import { assetToBase, assetAmount, BaseAmount } from '@xchainjs/xchain-util'
import { BTC_DECIMAL } from './utils'

const DEFAULT_SUGGESTED_TRANSACTION_FEE = 127

const toSochainNetwork = (net: string): string => {
  return net === 'testnet' ? 'BTCTEST' : 'BTC'
}

/**
 * Get address information.
 *
 * @see https://sochain.com/api#get-display-data-address
 *
 * @param {string} nodeUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {BtcAddressDTO}
 */
export const getAddress = async ({ nodeUrl, network, address }: AddressParams): Promise<BtcAddressDTO> => {
  try {
    const url = `${nodeUrl}/address/${toSochainNetwork(network)}/${address}`
    const response = await axios.get(url)
    const addressResponse: SochainResponse<BtcAddressDTO> = response.data
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
    const balanceResponse: SochainResponse<BtcGetBalanceDTO> = response.data
    const confirmed = assetAmount(balanceResponse.data.confirmed_balance, BTC_DECIMAL)
    const unconfirmed = assetAmount(balanceResponse.data.unconfirmed_balance, BTC_DECIMAL)
    const netAmt = confirmed.amount().plus(unconfirmed.amount())
    const result = assetToBase(assetAmount(netAmt, BTC_DECIMAL))
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
 * @returns {BtcAddressUTXOs}
 */
export const getUnspentTxs = async ({ nodeUrl, network, address }: AddressParams): Promise<BtcAddressUTXOs> => {
  try {
    const resp = await axios.get(`${nodeUrl}/get_tx_unspent/${toSochainNetwork(network)}/${address}`)
    const response: SochainResponse<BtcUnspentTxsDTO> = resp.data
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
    const response: SochainResponse<BtcBroadcastTransfer> = (await axios.post(url, data)).data
    return response.data.txid
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get Bitcoin suggested transaction fee.
 *
 * @returns {number} The Bitcoin suggested transaction fee per bytes in sat.
 */
export const getSuggestedTxFee = async (): Promise<number> => {
  //Note: sochain does not provide fee rate related data
  //This number is from https://bitcoinfees.earn.com API
  //Refer: https://bitcoinfees.earn.com/api
  try {
    const response = await axios.get('https://bitcoinfees.earn.com/api/v1/fees/recommended')
    return response.data.fastestFee
  } catch (error) {
    return DEFAULT_SUGGESTED_TRANSACTION_FEE
  }
}
