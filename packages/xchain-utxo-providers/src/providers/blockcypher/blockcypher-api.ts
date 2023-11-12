import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  BalanceParams,
  BlockcypherNetwork,
  BroadcastDTO,
  GetBalanceDTO,
  GetTxsDTO,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
} from './blockcypher-api-types'

/**
 * Get transaction by hash.
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ apiKey, baseUrl, network, hash, limit = 20 }: TxHashParams): Promise<Transaction> => {
  const params: Record<string, string> = { includeHex: 'true', limit: limit.toString() }
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
  unspentOnly,
}: {
  apiKey?: string
  address: string
  baseUrl: string
  network: BlockcypherNetwork
  limit: number
  beforeBlock?: number
  unspentOnly: boolean
}): Promise<GetTxsDTO> => {
  const params: Record<string, string> = { limit: `${limit}`, unspentOnly: `${unspentOnly}` }
  const url = `${baseUrl}/${network}/addrs/${address}`
  if (apiKey) params['token'] = apiKey
  if (beforeBlock) params['before'] = `${beforeBlock}`
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
  const confirmedAmount = baseAmount(balanceResponse.balance, assetDecimals)
  const finalBalance = baseAmount(balanceResponse.final_balance, assetDecimals)
  return confirmedOnly ? confirmedAmount : finalBalance
}

/**
 * Get Tx Confirmation status
 *
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
    confirmations: !!tx.confirmed ? 1 : 0,
    is_confirmed: !!tx.confirmed,
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

export const broadcastTx = async ({
  apiKey,
  baseUrl,
  network,
  txHex,
}: {
  apiKey?: string
  baseUrl: string
  txHex: string
  network: BlockcypherNetwork
}): Promise<TxHash> => {
  const params: Record<string, string> = {}
  const url = `${baseUrl}/${network}/txs/push`
  if (apiKey) params['token'] = apiKey
  const response = await axios.post(url, { tx: txHex }, { params })
  const broadcastResponse: BroadcastDTO = response.data
  return broadcastResponse.tx.hash
}
