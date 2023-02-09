import { Network } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import { DOGE_DECIMAL } from './const'
import {
  AddressParams,
  BalanceParams,
  DogeAddressDTO,
  DogeAddressUTXO,
  DogeGetBalanceDTO,
  DogeGetTxsDTO,
  DogeUnspentTxsDTO,
  SochainResponse,
  Transaction,
  TxHashParams,
} from './types/sochain-api-types'

const toSochainNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'DOGE'
    case Network.Testnet:
      return 'DOGETEST'
  }
}

export const getSendTxUrl = ({ sochainUrl, network }: { sochainUrl: string; network: Network }) => {
  return `${sochainUrl}/broadcast_transaction/${toSochainNetwork(network)}`
}

/**
 * Get address information.
 *
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {DogeAddressDTO}
 */
export const getAddress = async ({ apiKey, sochainUrl, network, address }: AddressParams): Promise<DogeAddressDTO> => {
  const url = `${sochainUrl}/address_summary/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const addressResponse: SochainResponse<DogeAddressDTO> = response.data
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
 * Get transactions
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
}): Promise<DogeGetTxsDTO> => {
  const url = `${sochainUrl}/transactions/${toSochainNetwork(network)}/${address}/${page}` //TODO support paging
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const txs: SochainResponse<DogeGetTxsDTO> = response.data
  return txs.data
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
  const balanceResponse: SochainResponse<DogeGetBalanceDTO> = response.data
  const confirmed = assetAmount(balanceResponse.data.confirmed, DOGE_DECIMAL)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed, DOGE_DECIMAL)
  const netAmt = confirmed.amount().plus(unconfirmed.amount())
  const result = assetToBase(assetAmount(netAmt, DOGE_DECIMAL))
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
 * @returns {DogeAddressUTXO[]}
 */
export const getUnspentTxs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  page,
}: AddressParams): Promise<DogeAddressUTXO[]> => {
  const url = [sochainUrl, 'unspent_outputs', toSochainNetwork(network), address, page].filter((v) => !!v).join('/')
  const resp = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const response: SochainResponse<DogeUnspentTxsDTO> = resp.data
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
