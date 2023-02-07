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
  LtcUnspentTxsDTO,
  SochainResponse,
  Transaction,
  TxHashParams,
} from './types/sochain-api-types'

const DEFAULT_SUGGESTED_TRANSACTION_FEE = 1

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
 * Get address information.
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
 * Get transaction by hash.
 *
 * @see https://sochain.com/api#get-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ apiKey, sochainUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${sochainUrl}/transaction/${toSochainNetwork(network)}/${hash}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const tx: SochainResponse<Transaction> = response.data
  return tx.data
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
export const getBalance = async ({ apiKey, sochainUrl, network, address }: BalanceParams): Promise<BaseAmount> => {
  const url = `${sochainUrl}/balance/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const balanceResponse: SochainResponse<LtcGetBalanceDTO> = response.data
  const confirmed = assetAmount(balanceResponse.data.confirmed_balance, LTC_DECIMAL)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed_balance, LTC_DECIMAL)
  const netAmt = confirmed.amount().plus(unconfirmed.amount())
  const result = assetToBase(assetAmount(netAmt, LTC_DECIMAL))
  return result
}

/**
 * Get unspent txs
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
  let resp = null
  resp = await axios.get(`${sochainUrl}/unspent_outputs/${toSochainNetwork(network)}/${address}/${page}`, {
    headers: { 'API-KEY': apiKey },
  })
  const response: SochainResponse<LtcUnspentTxsDTO> = resp.data
  const txs = response.data.txs
  if (txs.length === 10) {
    //fetch the next batch
    //const lastTxId = txs[99].txid

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

/**
 * Get Litecoin suggested transaction fee.
 *
 * @returns {number} The Litecoin suggested transaction fee per bytes in sat.
 */
export const getSuggestedTxFee = async (): Promise<number> => {
  //Note: sochain does not provide fee rate related data
  //So use Bitgo API for fee estimation
  //Refer: https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate
  try {
    const response = await axios.get('https://app.bitgo.com/api/v2/ltc/tx/fee')
    return response.data.feePerKb / 1000 // feePerKb to feePerByte
  } catch (error) {
    return DEFAULT_SUGGESTED_TRANSACTION_FEE
  }
}
