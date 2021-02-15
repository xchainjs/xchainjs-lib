import axios from 'axios'
import {
  AddressBalance,
  AddressParams,
  Transaction,
  TransactionsQueryParam,
  TxBroadcastParams,
  TxHashParams,
  TxUnspent,
} from './types'
import { DEFAULT_SUGGESTED_TRANSACTION_FEE } from './utils'

/**
 * Check error response.
 *
 * @param {any} response The api resonse.
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isErrorResponse = (response: any): boolean => {
  return !!response.error
}

/**
 * Get account from address.
 *
 * @param {string} clientUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {AddressBalance|null}
 */
export const getAccount = async ({ clientUrl, address }: AddressParams): Promise<AddressBalance | null> => {
  return axios
    .get(`${clientUrl}/address/${address}/balance`)
    .then((response) => (isErrorResponse(response.data) ? null : response.data))
}

/**
 * Get transaction by hash.
 *
 * @param {string} clientUrl The haskoin API url.
 * @param {string} txId The transaction id.
 * @returns {Transaction|null}
 */
export const getTransaction = async ({ clientUrl, txId }: TxHashParams): Promise<Transaction | null> => {
  return axios
    .get(`${clientUrl}/transaction/${txId}`)
    .then((response) => (isErrorResponse(response.data) ? null : response.data))
}

/**
 * Get transaction history.
 *
 * @param {string} clientUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @param {TransactionsQueryParam} params The API query parameters.
 * @returns {Array<Transaction>|null}
 */
export const getTransactions = async ({
  clientUrl,
  address,
  params,
}: AddressParams & { params: TransactionsQueryParam }): Promise<Transaction[] | null> => {
  return axios
    .get(`${clientUrl}/address/${address}/transactions/full`, {
      params,
    })
    .then((response) => (isErrorResponse(response.data) ? null : response.data))
}

/**
 * Get unspent transactions.
 *
 * @param {string} clientUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {Array<Transaction>|null}
 */
export const getUnspentTransactions = async ({ clientUrl, address }: AddressParams): Promise<TxUnspent[] | null> => {
  // Get transacton count for a given address.
  const account = await getAccount({ clientUrl, address })

  // Set limit to the transaction count.
  return await axios
    .get(`${clientUrl}/address/${address}/unspent?limit=${account?.txs}`)
    .then((response) => (isErrorResponse(response.data) ? null : response.data))
}

/**
 * Broadcast transaction.
 *
 * @param {string} clientUrl The haskoin API url.
 * @param {string} txHex
 * @returns {string} Transaction ID.
 *
 * @throws {"failed to broadcast a transaction"} thrown if failed to broadcast a transaction
 */
export const broadcastTx = async ({ clientUrl, txHex }: TxBroadcastParams): Promise<string> => {
  try {
    const url = `${clientUrl}/transactions`
    const result: { txid: string } | null = await axios
      .post(url, txHex)
      .then((response) => (isErrorResponse(response.data) ? null : response.data))

    if (!result) {
      throw new Error('failed to broadcast a transaction')
    }

    return result.txid
  } catch (error) {
    return Promise.reject(error)
  }
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
