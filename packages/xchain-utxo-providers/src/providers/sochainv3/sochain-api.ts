import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AddressDTO,
  AddressParams,
  AddressUTXO,
  BalanceParams,
  BroadcastDTO,
  GetBalanceDTO,
  GetTxsDTO,
  SochainNetwork,
  SochainResponse,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
  UnspentTxsDTO,
} from './sochain-api-types'

/**
 * Get address information.
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {AddressDTO}
 */
export const getAddress = async ({ apiKey, sochainUrl, network, address }: AddressParams): Promise<AddressDTO> => {
  const url = `${sochainUrl}/address_summary/${network}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const addressResponse: SochainResponse<AddressDTO> = response.data
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
  const url = `${sochainUrl}/transaction/${network}/${hash}`
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
  network: SochainNetwork
  page: number
}): Promise<GetTxsDTO> => {
  const url = `${sochainUrl}/transactions/${network}/${address}/${page}` //TODO support paging
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const txs: SochainResponse<GetTxsDTO> = response.data
  return txs.data
}
/**
 * Get address balance.
 *
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network Network
 * @param {string} address Address
 * @param {boolean} confirmedOnly Flag whether to get balances of confirmed txs only or for all
 * @returns {number}
 */
export const getBalance = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  confirmedOnly,
  assetDecimals,
}: BalanceParams): Promise<BaseAmount> => {
  const url = `${sochainUrl}/balance/${network}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const balanceResponse: SochainResponse<GetBalanceDTO> = response.data
  const confirmed = assetAmount(balanceResponse.data.confirmed, assetDecimals)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed, assetDecimals)
  const netAmt = confirmedOnly ? confirmed : confirmed.plus(unconfirmed)
  const result = assetToBase(netAmt)
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
 * @returns {AddressUTXO[]}
 */
export const getUnspentTxs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  page,
}: AddressParams): Promise<AddressUTXO[]> => {
  const url = [sochainUrl, 'unspent_outputs', network, address, page].filter((v) => !!v).join('/')
  const resp = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const response: SochainResponse<UnspentTxsDTO> = resp.data
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

/**
 * Get Tx Confirmation status
 *
 * @see https://sochain.com/api#get-is-tx-confirmed
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {Network} network
 * @param {string} hash tx id
 * @returns {TxConfirmedStatus}
 */
export const getIsTxConfirmed = async ({
  apiKey,
  sochainUrl,
  network,
  hash,
}: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ apiKey, sochainUrl, network, hash })
  return {
    network: network,
    txid: hash,
    confirmations: tx.confirmations,
    is_confirmed: tx.confirmations >= 1,
  }
}

/**
 * List of confirmed txs
 *
 * Stores a list of confirmed txs (hashes) in memory to avoid requesting same data
 */
const confirmedTxs: Array<TxHash> = []

/**
 * Helper to get `confirmed` status of a tx.
 *
 * It will get it from cache or try to get it from Sochain (if not cached before)
 */
export const getConfirmedTxStatus = async ({
  apiKey,
  txHash,
  sochainUrl,
  network,
}: {
  apiKey: string
  sochainUrl: string
  txHash: TxHash
  network: SochainNetwork
}): Promise<boolean> => {
  // try to get it from cache
  if (confirmedTxs.includes(txHash)) return true
  // or get status from Sochain
  const { is_confirmed } = await getIsTxConfirmed({
    apiKey,
    sochainUrl,
    network,
    hash: txHash,
  })
  // cache status
  confirmedTxs.push(txHash)
  return is_confirmed
}

/**
 * Get unspent txs and filter out pending UTXOs
 *
 * @see https://sochain.com/api#get-unspent-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {Network} network
 * @param {string} address
 * @returns {AddressUTXO[]}
 */
export const getConfirmedUnspentTxs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
}: AddressParams): Promise<AddressUTXO[]> => {
  const txs = await getUnspentTxs({
    apiKey,
    sochainUrl,
    network,
    address,
    page: 1,
  })

  const confirmedUTXOs: AddressUTXO[] = []

  await Promise.all(
    txs.map(async (tx: AddressUTXO) => {
      const confirmed = await getConfirmedTxStatus({
        apiKey,
        sochainUrl,
        network,
        txHash: tx.hash,
      })

      if (confirmed) {
        confirmedUTXOs.push(tx)
      }
    }),
  )

  return confirmedUTXOs
}

/**
 * Get address balance.
 *
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network Network
 * @param {string} address Address
 * @param {boolean} confirmedOnly Flag whether to get balances of confirmed txs only or for all
 * @returns {number}
 */
export const broadcastTx = async ({
  apiKey,
  sochainUrl,
  network,
  txHex,
}: {
  apiKey: string
  sochainUrl: string
  txHex: string
  network: SochainNetwork
}): Promise<TxHash> => {
  const url = `${sochainUrl}/broadcast_transaction/${network}`
  const response = await axios.post(url, { tx_hex: txHex }, { headers: { 'API-KEY': apiKey } })
  const broadcastResponse: BroadcastDTO = response.data
  return broadcastResponse.tx_hex
}
