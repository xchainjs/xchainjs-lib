import { Network } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import { LTC_DECIMAL } from './const'
import {
  AddressParams,
  BalanceParams,
  LtcAddressDTO,
  LtcAddressUTXO,
  LtcGetBalanceDTO,
  LtcGetTxsDTO,
  LtcUnspentTxsDTO,
  SochainResponse,
  Transaction,
  TxHashParams,
} from './types/sochain-api-types'
/**
 * Converts network identifier to Sochain network string.
 *
 * @param {Network} network The network identifier.
 * @returns {string} The corresponding Sochain network string.
 */
const toSochainNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'LTC'
    case Network.Testnet:
      return 'LTCTEST'
  }
}

/**
 * Retrieves address information from the Sochain API.
 *
 * @see https://sochain.com/api#get-display-data-address
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {LtcAddressDTO}
 */
export const getAddress = async ({ apiKey, sochainUrl, network, address }: AddressParams): Promise<LtcAddressDTO> => {
  const url = `${sochainUrl}/address_summary/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const addressResponse: SochainResponse<LtcAddressDTO> = response.data
  return addressResponse.data
}

/**
 * Retrieves transaction details by hash from the Sochain API.
 *
 * @see https://sochain.com/api#get-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ apiKey, sochainUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  // Constructs the URL for fetching transaction details
  const url = `${sochainUrl}/transaction/${toSochainNetwork(network)}/${hash}`
  // Sends a GET request to the Sochain API with the specified URL and API key
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const tx: SochainResponse<Transaction> = response.data
  return tx.data
}

/**
 *  Retrieves transactions associated with an address from the Sochain API.
 *
 * @see https://sochain.com/api#get-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTxs = async ({
  apiKey,
  address,
  sochainUrl,
  network,
  page,
}: {
  apiKey: string
  address: string
  sochainUrl: string
  network: Network
  page: number
}): Promise<LtcGetTxsDTO> => {
  // Constructs the URL for fetching transactions
  const url = `${sochainUrl}/transactions/${toSochainNetwork(network)}/${address}/${page}` //TODO support paging
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const txs: SochainResponse<LtcGetTxsDTO> = response.data
  return txs.data
}
/**
 * Retrieves the balance of an address from the Sochain API.
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {number}
 */
export const getBalance = async ({ apiKey, sochainUrl, network, address }: BalanceParams): Promise<BaseAmount> => {
  // Constructs the URL for fetching address balance
  const url = `${sochainUrl}/balance/${toSochainNetwork(network)}/${address}`
  // Sends a GET request to the Sochain API with the specified URL and API key
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const balanceResponse: SochainResponse<LtcGetBalanceDTO> = response.data
  // Processes the balance response and converts it to the appropriate format
  const confirmed = assetAmount(balanceResponse.data.confirmed, LTC_DECIMAL)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed, LTC_DECIMAL)
  const netAmt = confirmed.amount().plus(unconfirmed.amount())
  const result = assetToBase(assetAmount(netAmt, LTC_DECIMAL))
  return result
}

/**
 * Retrieves unspent transactions associated with an address from the Sochain API.
 *
 * @see https://sochain.com/api#get-unspent-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {LtcAddressUTXO[]}
 */
export const getUnspentTxs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  page,
}: AddressParams): Promise<LtcAddressUTXO[]> => {
  // Constructs the URL for fetching unspent transactions
  const url = [sochainUrl, 'unspent_outputs', toSochainNetwork(network), address, page].filter((v) => !!v).join('/')
  // Sends a GET request to the Sochain API with the specified URL and API key
  const resp = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const response: SochainResponse<LtcUnspentTxsDTO> = resp.data
  const txs = response.data.outputs
  if (txs.length === 10) {
    //fetch the next batch
    const nextBatch = await getUnspentTxs({
      apiKey,
      sochainUrl,
      network,
      address,
      page: page + 1,
    })
    return txs.concat(nextBatch)
  } else {
    return txs
  }
}
