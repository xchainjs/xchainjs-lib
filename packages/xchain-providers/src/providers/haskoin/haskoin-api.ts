/**
 * Module to interact with Haskoin API
 *
 * Doc (SwaggerHub) https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3
 *
 */

import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount, delay } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AddressBalance,
  AddressDTO,
  AddressParams,
  BalanceData,
  ErrorResponse,
  HaskoinNetwork,
  HaskoinResponse,
  RawTransaction,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
  TxUnspent,
} from './haskoin-api-types'

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
export const getAccount = async ({ haskoinUrl, network, address }: AddressParams): Promise<AddressBalance> => {
  const url = `${haskoinUrl}/${network}/address/${address}/balance`
  const result: AddressBalance | ErrorResponse = (await axios.get(url)).data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query account by given address ${address}`)
  return result
}

/**
 * Get address information.
 *
 * @param {string} haskoinUrl The haskoin node url.
 * @param {string} network
 * @param {string} address
 * @returns {AddressDTO}
 */
export const getAddress = async ({ haskoinUrl, network, address }: AddressParams): Promise<AddressDTO> => {
  const url = `${haskoinUrl}/${network}/address/${address}/balance`
  const response = await axios.get(url)
  const addressResponse: HaskoinResponse<AddressDTO> = response.data
  return addressResponse.data
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
export const getTx = async ({ haskoinUrl, txId, network }: TxHashParams): Promise<Transaction> => {
  const result: Transaction | ErrorResponse = (await axios.get(`${haskoinUrl}/${network}/transaction/${txId}`)).data
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
export const getRawTransaction = async ({ haskoinUrl, network, txId }: TxHashParams): Promise<string> => {
  const result: RawTransaction | ErrorResponse = (await axios.get(`${haskoinUrl}/${network}/transaction/${txId}/raw`))
    .data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query transaction by a given hash ${txId}`)
  return result.result
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
  limit,
  offset,
}: {
  address: string
  haskoinUrl: string
  network: HaskoinNetwork
  limit: number
  offset?: number
}): Promise<Transaction[]> => {
  const params: Record<string, string> = { limit: `${limit}`, offset: `${offset}` }
  const url = `${haskoinUrl}/${network}/address/${address}/transactions/full`
  const result: Transaction[] | ErrorResponse = (await axios.get(url, { params })).data
  if (!result || isErrorResponse(result)) throw new Error('failed to query transactions')
  return result
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
 * Get unspent transactions.
 *
 * @param {string} haskoinUrl The haskoin API url.
 * @param {string} address The BCH address.
 * @returns {TxUnspent[]}
 *
 * @throws {"failed to query unspent transactions"} thrown if failed to query unspent transactions
 */
export const getUnspentTxs = async ({ haskoinUrl, network, address }: AddressParams): Promise<TxUnspent[]> => {
  // Get transaction count for a given address.
  const account = await getAccount({ haskoinUrl, network, address })

  // Set limit to the transaction count to be all the utxos.
  const result: TxUnspent[] | ErrorResponse = (
    await axios.get(`${haskoinUrl}/${network}/address/${address}/unspent?limit${account?.utxo}`)
  ).data
  if (!result || isErrorResponse(result)) throw new Error('failed to query unspent transactions')
  return result
}

/**
 * Get Tx Confirmation status
 *
 * @param {string} haskoinUrl The haskoin node url.
 * @param {Network} network
 * @param {string} hash tx id
 * @returns {TxConfirmedStatus}
 */
export const getIsTxConfirmed = async ({ haskoinUrl, network, txId }: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ haskoinUrl, network, txId })
  return {
    network: network,
    txid: txId,
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
    txId: txHash,
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
export const getConfirmedUnspentTxs = async ({ haskoinUrl, network, address }: AddressParams): Promise<TxUnspent[]> => {
  const txs = await getUnspentTxs({
    haskoinUrl,
    network,
    address,
  })

  const confirmedUTXOs: TxUnspent[] = []

  await Promise.all(
    txs.map(async (tx: TxUnspent) => {
      const confirmed = await getConfirmedTxStatus({
        haskoinUrl,
        network,
        txHash: tx.txid,
      })

      if (confirmed) {
        confirmedUTXOs.push(tx)
      }
    }),
  )

  return confirmedUTXOs
}

// Stores list of txHex in memory to avoid requesting same data
const txHexMap: Record<TxHash, string> = {}
/**
 * Helper to get `hex` of `Tx`
 *
 * It will try to get it from cache before requesting it from Sochain
 */
export const getTxHex = async ({ haskoinUrl, network, txId }: TxHashParams): Promise<string> => {
  // try to get hex from cache
  let txHex = txHexMap[txId]
  if (!!txHex) return txHex
  // or get it from Haskoin
  txHex = await getRawTransaction({ haskoinUrl, txId: txId, network: network })
  // cache it
  txHexMap[txId] = txHex
  return txHex
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
export const getUnspentTransactions = async ({ haskoinUrl, network, address }: AddressParams): Promise<TxUnspent[]> => {
  // Get transaction count for a given address.
  const account = await getAccount({ haskoinUrl, network, address })

  // Set limit to the transaction count to be all the utxos.
  const result: TxUnspent[] | ErrorResponse = (
    await axios.get(`${haskoinUrl}/${network}/address/${address}/unspent?limit${account?.utxo}`)
  ).data
  if (!result || isErrorResponse(result)) throw new Error('failed to query unspent transactions')
  return result
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
export const broadcastTx = async ({
  txHex,
  haskoinUrl,
  haskoinNetwork,
}: {
  txHex: string
  haskoinUrl: string
  haskoinNetwork: string
}): Promise<TxHash> => {
  const MAX_RETRIES = 5
  let retries = 0

  const axiosInstance = axios.create()

  const url = `${haskoinUrl}/${haskoinNetwork}/transactions`

  while (retries < MAX_RETRIES) {
    try {
      const response = await axiosInstance.post<{ txid: string }>(url, txHex)
      const { txid } = response.data
      return txid
    } catch (error: any) {
      if (error.response?.status === 500) {
        retries++
        await delay(1000 * retries)
      } else {
        return Promise.reject(error)
      }
    }
  }

  return Promise.reject(new Error('Max retries exceeded'))
}

//Original
// /**
//  * Broadcast transaction.
//  *
//  * @see https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3#/blockchain/sendTransaction
//  *
//  * Note: Because of an Haskoin issue (@see https://github.com/haskoin/haskoin-store/issues/25),
//  * we need to broadcast same tx several times in case of `500` errors
//  * @see https://github.com/xchainjs/xchainjs-lib/issues/492
//  *
//  * @param {BroadcastTxParams} params
//  * @returns {TxHash} Transaction hash.
//  */
// export const broadcastTx = async ({
//   txHex,
//   haskoinUrl,
//   haskoinNetwork,
// }: {
//   txHex: string
//   haskoinUrl: string
//   haskoinNetwork: string
// }): Promise<TxHash> => {
//   const MAX = 5
//   let counter = 0
//   const onFullfilled = (res: AxiosResponse): AxiosResponse => res
//   const onRejected = async (error: AxiosError): Promise<AxiosResponse> => {
//     const config = error.config
//     if (counter < MAX && error.response?.status === 500) {
//       counter++
//       await delay(200 * counter)
//       return axios.request(config)
//     }
//     return Promise.reject(error)
//   }
//   // All logic for re-sending same tx is handled by Axios' response interceptor
//   // https://github.com/axios/axios#interceptors
//   const id = axios.interceptors.response.use(onFullfilled, onRejected)

//   const url = `${haskoinUrl}/${haskoinNetwork}/transactions`
//   try {
//     const {
//       data: { txid },
//     } = await axios.post<string, AxiosResponse<{ txid: string }>>(url, txHex)
//     // clean up interceptor from axios axios
//     axios.interceptors.response.eject(id)
//     return txid
//   } catch (error: unknown) {
//     // clean up interceptor from axios axios
//     axios.interceptors.response.eject(id)
//     return Promise.reject(error)
//   }
// }
