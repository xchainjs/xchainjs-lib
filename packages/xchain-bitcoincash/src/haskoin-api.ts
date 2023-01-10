import { TxHash } from '@xchainjs/xchain-client'
import { delay } from '@xchainjs/xchain-util'
import axios, { AxiosError, AxiosResponse } from 'axios'

import {
  AddressBalance,
  AddressParams,
  BroadcastTxParams,
  RawTransaction,
  Transaction,
  TransactionsQueryParam,
  TxHashParams,
  TxUnspent,
} from './types'
import { DEFAULT_SUGGESTED_TRANSACTION_FEE } from './utils'

type ErrorResponse = { error: unknown }

/**
 * Check error response.
 *
 * @param {any} response The api response.
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isErrorResponse = (response: any): response is ErrorResponse => {
  return !!response.error
}

/**
 * Get account from address.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {AddressBalance}
 *
 * @throws {"failed to query account by a given address"} thrown if failed to query account by a given address
 */
export const getAccount = async ({ haskoinUrl, address }: AddressParams): Promise<AddressBalance> => {
  const result: AddressBalance | ErrorResponse = (await axios.get(`${haskoinUrl}/address/${address}/balance`)).data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query account by given address ${address}`)
  return result
}

/**
 * Get transaction by hash.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} txId The transaction id.
 * @returns {Transaction}
 *
 * @throws {"failed to query transaction by a given hash"} thrown if failed to query transaction by a given hash
 */
export const getTransaction = async ({ haskoinUrl, txId }: TxHashParams): Promise<Transaction> => {
  const result: Transaction | ErrorResponse = (await axios.get(`${haskoinUrl}/transaction/${txId}`)).data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query transaction by a given hash ${txId}`)
  return result
}

/**
 * Get raw transaction by hash.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} txId The transaction id.
 * @returns {Transaction}
 *
 * @throws {"failed to query transaction by a given hash"} thrown if failed to query raw transaction by a given hash
 */
export const getRawTransaction = async ({ haskoinUrl, txId }: TxHashParams): Promise<string> => {
  const result: RawTransaction | ErrorResponse = (await axios.get(`${haskoinUrl}/transaction/${txId}/raw`)).data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query transaction by a given hash ${txId}`)
  return result.result
}

/**
 * Get transaction history.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @param {TransactionsQueryParam} params The API query parameters.
 * @returns {Transaction[]}
 *
 * @throws {"failed to query transactions"} thrown if failed to query transactions
 */
export const getTransactions = async ({
  haskoinUrl,
  address,
  params,
}: AddressParams & { params: TransactionsQueryParam }): Promise<Transaction[]> => {
  const result: Transaction[] | ErrorResponse = (
    await axios.get(`${haskoinUrl}/address/${address}/transactions/full`, { params })
  ).data
  if (!result || isErrorResponse(result)) throw new Error('failed to query transactions')
  return result
}

/**
 * Get unspent transactions.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {TxUnspent[]}
 *
 * @throws {"failed to query unspent transactions"} thrown if failed to query unspent transactions
 */
export const getUnspentTransactions = async ({ haskoinUrl, address }: AddressParams): Promise<TxUnspent[]> => {
  // Get transaction count for a given address.
  const account = await getAccount({ haskoinUrl, address })

  // Set limit to the transaction count to be all the utxos.
  const result: TxUnspent[] | ErrorResponse = (
    await axios.get(`${haskoinUrl}/address/${address}/unspent?limit${account?.utxo}`)
  ).data
  if (!result || isErrorResponse(result)) throw new Error('failed to query unspent transactions')
  return result
}

/**
 * Get suggested fee amount for Bitcoin cash. (fee per byte)
 *
 * @returns {number} The Bitcoin cash stats.
 */
export const getSuggestedFee = async (): Promise<number> => {
  //Note: Haskcoin does not provide fee rate related data
  //So use Bitgo API for fee estimation
  //Refer: https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate
  try {
    const response = await axios.get('https://app.bitgo.com/api/v2/bch/tx/fee')
    return response.data.feePerKb / 1000 // feePerKb to feePerByte
  } catch (error) {
    return DEFAULT_SUGGESTED_TRANSACTION_FEE
  }
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
export const broadcastTx = async ({ txHex, haskoinUrl }: BroadcastTxParams): Promise<TxHash> => {
  const MAX = 5
  let counter = 0

  const onFullfilled = (res: AxiosResponse): AxiosResponse => res
  const onRejected = async (error: AxiosError): Promise<AxiosResponse> => {
    const config = error.config || axios.defaults
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
