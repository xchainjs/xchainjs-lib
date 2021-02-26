import axios from 'axios'
import {
  AddressBalance,
  AddressParams,
  RawTransaction,
  Transaction,
  TransactionsQueryParam,
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
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {AddressBalance}
 *
 * @throws {"failed to query account by a given address"} thrown if failed to query account by a given address
 */
export const getAccount = async ({ haskoinUrl, address }: AddressParams): Promise<AddressBalance> => {
  try {
    const result: AddressBalance | null = await axios
      .get(`${haskoinUrl}/address/${address}/balance`)
      .then((response) => (isErrorResponse(response.data) ? null : response.data))

    if (!result) {
      throw new Error('failed to query account by a given address')
    }

    return result
  } catch (error) {
    return Promise.reject(error)
  }
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
  try {
    const result: Transaction | null = await axios
      .get(`${haskoinUrl}/transaction/${txId}`)
      .then((response) => (isErrorResponse(response.data) ? null : response.data))

    if (!result) {
      throw new Error('failed to query transaction by a given hash')
    }

    return result
  } catch (error) {
    return Promise.reject(error)
  }
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
  try {
    const result: RawTransaction | null = await axios
      .get(`${haskoinUrl}/transaction/${txId}/raw`)
      .then((response) => (isErrorResponse(response.data) ? null : response.data))

    if (!result) {
      throw new Error('failed to query transaction by a given hash')
    }

    return result.result
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get transaction history.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @param {TransactionsQueryParam} params The API query parameters.
 * @returns {Array<Transaction>}
 *
 * @throws {"failed to query transactions"} thrown if failed to query transactions
 */
export const getTransactions = async ({
  haskoinUrl,
  address,
  params,
}: AddressParams & { params: TransactionsQueryParam }): Promise<Transaction[]> => {
  try {
    const result: Transaction[] | null = await axios
      .get(`${haskoinUrl}/address/${address}/transactions/full`, {
        params,
      })
      .then((response) => (isErrorResponse(response.data) ? null : response.data))

    if (!result) {
      throw new Error('failed to query transactions')
    }

    return result
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Get unspent transactions.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {Array<TxUnspent>}
 *
 * @throws {"failed to query unspent transactions"} thrown if failed to query unspent transactions
 */
export const getUnspentTransactions = async ({ haskoinUrl, address }: AddressParams): Promise<TxUnspent[]> => {
  try {
    // Get transacton count for a given address.
    const account = await getAccount({ haskoinUrl, address })

    // Set limit to the transaction count.
    const result: TxUnspent[] | null = await axios
      .get(`${haskoinUrl}/address/${address}/unspent?limit=${account?.txs}`)
      .then((response) => (isErrorResponse(response.data) ? null : response.data))

    if (!result) {
      throw new Error('failed to query unspent transactions')
    }

    return result
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
