import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AddressParams,
  AddressUTXO,
  BalanceParams,
  BlockcypherNetwork,
  BroadcastDTO,
  GetBalanceDTO,
  GetTxsDTO,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
  UnspentTxsDTO,
} from './blockcypher-api-types'

// /**
//  * Get address information.
//  *
//  * @param {string} baseUrl The sochain node url.
//  * @param {string} network
//  * @param {string} address
//  * @returns {AddressDTO}
//  */
// export const getAddress = async ({ apiKey, baseUrl, network, address }: AddressParams): Promise<AddressDTO> => {
//   const url = `${baseUrl}/${network}/addrs/${address}/balance`
//   const urlWithKey = apiKey ? `${url}?${apiKey}` : url
//   const response = await axios.get(urlWithKey)
//   const addressResponse: AddressDTO = response.data
//   return addressResponse
// }

/**
 * Get transaction by hash.
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ apiKey, baseUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  const params: Record<string, string> = { includeHex: 'true' }
  if (apiKey) params['token'] = apiKey
  const url = `${baseUrl}/${network}/txs/${hash}`
  const response = await axios.get(url, { params })
  const tx: Transaction = response.data
  return tx
}

/**
 * Get transactions
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTxs = async ({
  apiKey,
  address,
  baseUrl,
  network,
  beforeBlock,
  limit,
}: {
  apiKey: string
  address: string
  baseUrl: string
  network: BlockcypherNetwork
  limit: number
  beforeBlock?: number
}): Promise<GetTxsDTO> => {
  const params: Record<string, string> = { limit: `${limit}` }
  const url = `${baseUrl}/${network}/addrs/${address}?limit=2000;`
  if (apiKey) params['token'] = apiKey
  if (beforeBlock) params['beforeBlock'] = `${beforeBlock}`
  const response = await axios.get(url, { params })
  const txs: GetTxsDTO = response.data
  return txs
}
/**
 * Get address balance.
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} network Network
 * @param {string} address Address
 * @param {boolean} confirmedOnly Flag whether to get balances of confirmed txs only or for all
 * @returns {number}
 */
export const getBalance = async ({
  apiKey,
  baseUrl,
  network,
  address,
  confirmedOnly,
  assetDecimals,
}: BalanceParams): Promise<BaseAmount> => {
  const params: Record<string, string> = {}
  const url = `${baseUrl}/${network}/addrs/${address}/balance`
  if (apiKey) params['token'] = apiKey
  const response = await axios.get(url, { params })
  const balanceResponse: GetBalanceDTO = response.data
  const total = assetAmount(balanceResponse.final_balance, assetDecimals)
  const unconfirmed = assetAmount(balanceResponse.unconfirmed_balance, assetDecimals)
  const netAmt = !confirmedOnly ? unconfirmed : total
  const result = assetToBase(netAmt)
  return result
}

/**
 * Get unspent txs
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {AddressUTXO[]}
 */
export const getUnspentTxs = async ({
  apiKey,
  baseUrl,
  network,
  address,
  page,
}: AddressParams): Promise<AddressUTXO[]> => {
  const params: Record<string, string> = {}
  const url = [baseUrl, 'unspent_outputs', network, address, page].filter((v) => !!v).join('/')
  const resp = await axios.get(url, { params })
  const response: UnspentTxsDTO = resp.data
  const txs = response.outputs
  if (txs.length === 10) {
    //fetch the next batch

    const nextBatch = await getUnspentTxs({
      apiKey,
      baseUrl,
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
 * @param {string} baseUrl The sochain node url.
 * @param {Network} network
 * @param {string} hash tx id
 * @returns {TxConfirmedStatus}
 */
export const getIsTxConfirmed = async ({
  apiKey,
  baseUrl,
  network,
  hash,
}: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ apiKey, baseUrl, network, hash })
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
  baseUrl,
  network,
}: {
  apiKey?: string
  baseUrl: string
  txHash: TxHash
  network: BlockcypherNetwork
}): Promise<boolean> => {
  // try to get it from cache
  if (confirmedTxs.includes(txHash)) return true
  // or get status from Sochain
  const { is_confirmed } = await getIsTxConfirmed({
    apiKey,
    baseUrl,
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
 * @param {string} baseUrl The sochain node url.
 * @param {Network} network
 * @param {string} address
 * @returns {AddressUTXO[]}
 */
export const getConfirmedUnspentTxs = async ({
  apiKey,
  baseUrl,
  network,
  address,
}: AddressParams): Promise<AddressUTXO[]> => {
  const txs = await getUnspentTxs({
    apiKey,
    baseUrl,
    network,
    address,
    page: 1,
  })

  const confirmedUTXOs: AddressUTXO[] = []

  await Promise.all(
    txs.map(async (tx: AddressUTXO) => {
      const confirmed = await getConfirmedTxStatus({
        apiKey,
        baseUrl,
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
 * @param {string} baseUrl The sochain node url.
 * @param {string} network Network
 * @param {string} address Address
 * @param {boolean} confirmedOnly Flag whether to get balances of confirmed txs only or for all
 * @returns {number}
 */
export const broadcastTx = async ({
  apiKey,
  baseUrl,
  network,
  txHex,
}: {
  apiKey: string
  baseUrl: string
  txHex: string
  network: BlockcypherNetwork
}): Promise<TxHash> => {
  const url = `${baseUrl}/broadcast_transaction/${network}`
  const response = await axios.post(url, { tx_hex: txHex }, { headers: { 'API-KEY': apiKey } })
  const broadcastResponse: BroadcastDTO = response.data
  return broadcastResponse.hash
}
