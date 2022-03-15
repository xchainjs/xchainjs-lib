import { Network } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import { DOGE_DECIMAL } from './const'
import {
  DogeAddressDTO,
  DogeAddressUTXO,
  DogeGetBalanceDTO,
  DogeUnspentTxsDTO,
  SochainResponse,
  Transaction,
  TxHashParams,
} from './types/sochain-api-types'

const toSochainNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
      return 'DOGE'
    case Network.Stagenet:
      return 'DOGE'
    case Network.Testnet:
      return 'DOGETEST'
  }
}

export const getSendTxUrl = ({ sochainUrl, network }: { sochainUrl: string; network: Network }) => {
  return `${sochainUrl}/send_tx/${toSochainNetwork(network)}`
}

/**
 * Get address information.
 *
 * @see https://sochain.com/api#get-display-data-address
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {DogeAddressDTO}
 */
export const getAddress = async ({
  sochainUrl,
  network,
  address,
}: {
  sochainUrl: string
  network: Network
  address: string
}): Promise<DogeAddressDTO> => {
  const url = `${sochainUrl}/address/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url)
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
export const getTx = async ({ sochainUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${sochainUrl}/get_tx/${toSochainNetwork(network)}/${hash}`
  const response = await axios.get(url)
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
export const getBalance = async ({
  sochainUrl,
  network,
  address,
}: {
  sochainUrl: string
  network: Network
  address: string
}): Promise<BaseAmount> => {
  const url = `${sochainUrl}/get_address_balance/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url)
  const balanceResponse: SochainResponse<DogeGetBalanceDTO> = response.data
  const confirmed = assetAmount(balanceResponse.data.confirmed_balance, DOGE_DECIMAL)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed_balance, DOGE_DECIMAL)
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
  sochainUrl,
  network,
  address,
  startingFromTxId,
}: {
  sochainUrl: string
  network: Network
  address: string
  startingFromTxId?: string
}): Promise<DogeAddressUTXO[]> => {
  let resp = null
  if (startingFromTxId) {
    resp = await axios.get(`${sochainUrl}/get_tx_unspent/${toSochainNetwork(network)}/${address}/${startingFromTxId}`)
  } else {
    resp = await axios.get(`${sochainUrl}/get_tx_unspent/${toSochainNetwork(network)}/${address}`)
  }
  const response: SochainResponse<DogeUnspentTxsDTO> = resp.data
  const txs = response.data.txs
  if (txs.length === 100) {
    //fetch the next batch
    const lastTxId = txs[99].txid

    const nextBatch = await getUnspentTxs({
      sochainUrl,
      network,
      address,
      startingFromTxId: lastTxId,
    })
    return txs.concat(nextBatch)
  } else {
    return txs
  }
}
