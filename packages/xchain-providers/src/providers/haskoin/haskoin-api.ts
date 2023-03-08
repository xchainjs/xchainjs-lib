/**
 * Module to interact with Haskoin API
 *
 * Doc (SwaggerHub) https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3
 *
 */

import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount, delay } from '@xchainjs/xchain-util'
import axios, { AxiosError, AxiosResponse } from 'axios'

import type {
  AddressDTO,
  AddressParams,
  AddressUTXO,
  BalanceData,
  GetTxsDTO,
  HaskoinNetwork,
  HaskoinResponse,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
} from './haskoin-api-types'

/**
 * Get address information.
 *
 * @param {string} haskoinUrl The haskoin node url.
 * @param {string} network
 * @param {string} address
 * @returns {AddressDTO}
 */
export const getAddress = async ({ apiKey, haskoinUrl, network, address }: AddressParams): Promise<AddressDTO> => {
  const url = `${haskoinUrl}/${network}/address/${address}/balance`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const addressResponse: HaskoinResponse<AddressDTO> = response.data
  return addressResponse.data
}

/**
 * Get transaction by hash.
 *
 * @see https://haskoin.com/api#get-tx
 *
 * @param {string} haskoinUrl The haskoin node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ haskoinUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${haskoinUrl}/${network}/transaction/${hash}`
  const response = await axios.get(url)
  const tx: HaskoinResponse<Transaction> = response.data
  return tx.data
}

/**
 * Get transactions
 *
 * @see https://haskoin.com/api#get-tx
 *
 * @param {string} haskoinUrl The haskoin node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTxs = async ({
  address,
  haskoinUrl,
  network,
  page,
}: {
  address: string
  haskoinUrl: string
  network: HaskoinNetwork
  page: number
}): Promise<GetTxsDTO> => {
  const url = `${haskoinUrl}/${network}/${address}/transactions/${page}` //TODO support paging
  const response = await axios.get(url)
  const txs: HaskoinResponse<GetTxsDTO> = response.data
  return txs.data
}

/**
 *
 * @param param
 * @returns Returns BaseAmount
 */
export const getBalance = async ({
  haskoinUrl,
  haskoinNetwork,
  address,
  confirmedOnly,
  assetDecimals,
}: {
  haskoinUrl: string
  haskoinNetwork: string
  address: string
  confirmedOnly: boolean
  assetDecimals: number
}): Promise<BaseAmount> => {
  const {
    data: { confirmed, unconfirmed },
  } = await axios.get<BalanceData>(`${haskoinUrl}/${haskoinNetwork}/address/${address}/balance`)

  const confirmedAmount = baseAmount(confirmed, assetDecimals)
  const unconfirmedAmount = baseAmount(unconfirmed, assetDecimals)

  return confirmedOnly ? confirmedAmount : confirmedAmount.plus(unconfirmedAmount)
}

/**
 *
 * @param param0
 * @returns unspent transactions
 */
export const getUnspentTxs = async ({
  haskoinUrl,
  network,
  address,
}: {
  haskoinUrl: string
  network: string
  address: string
}): Promise<AddressUTXO[]> => {
  const { data: response } = await axios.get<AddressUTXO[]>(`${haskoinUrl}/${network}/address/${address}/unspent`)
  return response
}

/**
 * Get Tx Confirmation status
 *
 * @param {string} haskoinUrl The haskoin node url.
 * @param {Network} network
 * @param {string} hash tx id
 * @returns {TxConfirmedStatus}
 */
export const getIsTxConfirmed = async ({ haskoinUrl, network, hash }: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ haskoinUrl, network, hash })
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
 * It will get it from cache or try to get it from haskoin (if not cached before)
 */
export const getConfirmedTxStatus = async ({
  txHash,
  haskoinUrl,
  network,
}: {
  apiKey: string
  haskoinUrl: string
  txHash: TxHash
  network: HaskoinNetwork
}): Promise<boolean> => {
  // try to get it from cache
  if (confirmedTxs.includes(txHash)) return true
  // or get status from haskoin
  const { is_confirmed } = await getIsTxConfirmed({
    haskoinUrl,
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
 * @see https://haskoin.com/api#get-unspent-tx
 *
 * @param {string} haskoinUrl The haskoin node url.
 * @param {Network} network
 * @param {string} address
 * @returns {AddressUTXO[]}
 */
export const getConfirmedUnspentTxs = async ({
  apiKey,
  haskoinUrl,
  network,
  address,
}: AddressParams): Promise<AddressUTXO[]> => {
  const txs = await getUnspentTxs({
    haskoinUrl,
    network,
    address,
  })

  const confirmedUTXOs: AddressUTXO[] = []

  await Promise.all(
    txs.map(async (tx: AddressUTXO) => {
      const confirmed = await getConfirmedTxStatus({
        apiKey,
        haskoinUrl,
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
 * Broadcast transaction.
 *
 * @see https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3#/blockchain/sendTransaction
 *
 * Note: Because of an Haskoin issue (@see https://github.com/haskoin/haskoin-store/issues/25),
 * we need to broadcast same tx several times in case of `500` errors
 * @see https://github.com/xchainjs/xchainjs-lib/issues/492
 *
 * @param {BroadcastTxParams} params
 * @returns {TxHash} Transaction hash.
 */
export const broadcastTx = async ({ txHex, haskoinUrl }: { txHex: string; haskoinUrl: string }): Promise<TxHash> => {
  const MAX = 5
  let counter = 0

  const onFullfilled = (res: AxiosResponse): AxiosResponse => res
  const onRejected = async (error: AxiosError): Promise<AxiosResponse> => {
    const config = error.config
    if (counter < MAX && error.response?.status === 500) {
      counter++
      await delay(200 * counter)
      return axios.request(config)
    }
    return Promise.reject(error)
  }
  // All logic for re-sending same tx is handled by Axios' response interceptor
  // https://github.com/axios/axios#interceptors
  const id = axios.interceptors.response.use(onFullfilled, onRejected)

  const url = `${haskoinUrl}/transactions`
  try {
    const {
      data: { txid },
    } = await axios.post<string, AxiosResponse<{ txid: string }>>(url, txHex)
    // clean up interceptor from axios axios
    axios.interceptors.response.eject(id)
    return txid
  } catch (error: unknown) {
    // clean up interceptor from axios axios
    axios.interceptors.response.eject(id)
    return Promise.reject(error)
  }
}
