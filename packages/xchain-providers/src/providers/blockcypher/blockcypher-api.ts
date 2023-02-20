import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AddressDTO,
  AddressParams,
  AddressUTXO,
  BalanceParams,
  BlockcypherNetwork,
  BlockcypherResponse,
  BroadcastDTO,
  GetBalanceDTO,
  GetTxsDTO,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
  UnspentTxsDTO,
} from './blockcypher-api-types'

/**
 * Get address information.
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {string} network
 * @param {string} address
 * @returns {AddressDTO}
 */
export const getAddress = async ({ apiKey, blockcypherUrl, network, address }: AddressParams): Promise<AddressDTO> => {
  const url = `${blockcypherUrl}/${network}/addrs/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const addressResponse: BlockcypherResponse<AddressDTO> = response.data
  return addressResponse.data
}

/**
 * Get transaction by hash.
 *
 * @see https://blockcypher.com/api#get-tx
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ apiKey, blockcypherUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${blockcypherUrl}/transaction/${network}/${hash}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const tx: BlockcypherResponse<Transaction> = response.data
  return tx.data
}

/**
 * Get transactions
 *
 * @see https://blockcypher.com/api#get-tx
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTxs = async ({
  apiKey,
  address,
  blockcypherUrl,
  network,
  page,
}: {
  apiKey: string
  address: string
  blockcypherUrl: string
  network: BlockcypherNetwork
  page: number
}): Promise<GetTxsDTO> => {
  const url = `${blockcypherUrl}/transactions/${network}/${address}/${page}` //TODO support paging
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const txs: BlockcypherResponse<GetTxsDTO> = response.data
  return txs.data
}
/**
 * Get address balance.
 *
 * @see https://blockcypher.com/api#get-balance
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {string} network Network
 * @param {string} address Address
 * @param {boolean} confirmedOnly Flag whether to get balances of confirmed txs only or for all
 * @returns {number}
 */
export const getBalance = async ({
  apiKey,
  blockcypherUrl,
  chain,
  network,
  address,
  confirmedOnly,
  assetDecimals,
}: BalanceParams): Promise<BaseAmount> => {
  const url = `${blockcypherUrl}/${chain}/${network}/addrs/${address}/balance`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const balanceResponse: BlockcypherResponse<GetBalanceDTO> = response.data
  console.log(`${JSON.stringify(balanceResponse.data)}`)
  const confirmed = assetAmount(balanceResponse.data.balance, assetDecimals)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed, assetDecimals)
  const netAmt = confirmedOnly ? confirmed : confirmed.plus(unconfirmed)
  const result = assetToBase(netAmt)
  return result
}

/**
 * Get unspent txs
 *
 * @see https://blockcypher.com/api#get-unspent-tx
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {string} network
 * @param {string} address
 * @returns {AddressUTXO[]}
 */
export const getUnspentTxs = async ({
  apiKey,
  blockcypherUrl,
  network,
  address,
  page,
}: AddressParams): Promise<AddressUTXO[]> => {
  const url = [blockcypherUrl, 'unspent_outputs', network, address, page].filter((v) => !!v).join('/')
  const resp = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const response: BlockcypherResponse<UnspentTxsDTO> = resp.data
  const txs = response.data.outputs
  if (txs.length === 10) {
    //fetch the next batch

    const nextBatch = await getUnspentTxs({
      apiKey,
      blockcypherUrl,
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
 * @see https://blockcypher.com/api#get-is-tx-confirmed
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {Network} network
 * @param {string} hash tx id
 * @returns {TxConfirmedStatus}
 */
export const getIsTxConfirmed = async ({
  apiKey,
  blockcypherUrl,
  network,
  hash,
}: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ apiKey, blockcypherUrl, network, hash })
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
 * It will get it from cache or try to get it from blockcypher (if not cached before)
 */
export const getConfirmedTxStatus = async ({
  apiKey,
  txHash,
  blockcypherUrl,
  network,
}: {
  apiKey: string
  blockcypherUrl: string
  txHash: TxHash
  network: BlockcypherNetwork
}): Promise<boolean> => {
  // try to get it from cache
  if (confirmedTxs.includes(txHash)) return true
  // or get status from blockcypher
  const { is_confirmed } = await getIsTxConfirmed({
    apiKey,
    blockcypherUrl,
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
 * @see https://blockcypher.com/api#get-unspent-tx
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {Network} network
 * @param {string} address
 * @returns {AddressUTXO[]}
 */
export const getConfirmedUnspentTxs = async ({
  apiKey,
  blockcypherUrl,
  network,
  address,
}: AddressParams): Promise<AddressUTXO[]> => {
  const txs = await getUnspentTxs({
    apiKey,
    blockcypherUrl,
    network,
    address,
    page: 1,
  })

  const confirmedUTXOs: AddressUTXO[] = []

  await Promise.all(
    txs.map(async (tx: AddressUTXO) => {
      const confirmed = await getConfirmedTxStatus({
        apiKey,
        blockcypherUrl,
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
 * @see https://blockcypher.com/api#get-balance
 *
 * @param {string} blockcypherUrl The blockcypher node url.
 * @param {string} network Network
 * @param {string} address Address
 * @param {boolean} confirmedOnly Flag whether to get balances of confirmed txs only or for all
 * @returns {number}
 */
export const broadcastTx = async ({
  apiKey,
  blockcypherUrl,
  network,
  txHex,
}: {
  apiKey: string
  blockcypherUrl: string
  txHex: string
  network: BlockcypherNetwork
}): Promise<TxHash> => {
  const url = `${blockcypherUrl}/broadcast_transaction/${network}`
  const response = await axios.post(url, { tx_hex: txHex }, { headers: { 'API-KEY': apiKey } })
  const broadcastResponse: BlockcypherResponse<BroadcastDTO> = response.data
  return broadcastResponse.data.hash
}
