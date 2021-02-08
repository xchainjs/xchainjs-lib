import axios from 'axios'
import { AddressBalance, Transaction, TransactionsQueryParam } from './types'

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
 * @returns {AddressBalance|ErrorResponse}
 */
export const getAccount = async (clientUrl: string, address: string): Promise<AddressBalance | null> => {
  return axios
    .get(`${clientUrl}/address/${address}/balance`)
    .then((response) => (isErrorResponse(response.data) ? null : response.data))
}

/**
 * Get transaction by hash.
 *
 * @param {string} clientUrl The haskoin API url.
 * @param {string} txId The transaction id.
 * @returns {Transaction|ErrorResponse}
 */
export const getTransaction = async (clientUrl: string, txId: string): Promise<Transaction | null> => {
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
 * @returns {Array<Transaction>|ErrorResponse}
 */
export const getTransactions = async (
  clientUrl: string,
  address: string,
  params: TransactionsQueryParam,
): Promise<Transaction[] | null> => {
  return axios
    .get(`${clientUrl}/address/${address}/transactions/full`, {
      params,
    })
    .then((response) => (isErrorResponse(response.data) ? null : response.data))
}
