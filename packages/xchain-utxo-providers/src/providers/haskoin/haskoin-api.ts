// https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isErrorResponse = (response: any): response is ErrorResponse => {
  return !!response.error
}
export const getAccount = async ({ haskoinUrl, network, address }: AddressParams): Promise<AddressBalance> => {
  const url = `${haskoinUrl}/${network}/address/${address}/balance`
  const result: AddressBalance | ErrorResponse = (await axios.get(url)).data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query account by given address ${address}`)
  return result
}

export const getAddress = async ({ haskoinUrl, network, address }: AddressParams): Promise<AddressDTO> => {
  const url = `${haskoinUrl}/${network}/address/${address}/balance`
  const response = await axios.get(url)
  const addressResponse: HaskoinResponse<AddressDTO> = response.data
  return addressResponse.data
}

export const getTx = async ({ haskoinUrl, txId, network }: TxHashParams): Promise<Transaction> => {
  const result: Transaction | ErrorResponse = (await axios.get(`${haskoinUrl}/${network}/transaction/${txId}`)).data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query transaction by a given hash ${txId}`)
  return result
}

export const getRawTransaction = async ({ haskoinUrl, network, txId }: TxHashParams): Promise<string> => {
  const result: RawTransaction | ErrorResponse = (await axios.get(`${haskoinUrl}/${network}/transaction/${txId}/raw`))
    .data
  if (!result || isErrorResponse(result)) throw new Error(`failed to query transaction by a given hash ${txId}`)
  return result.result
}

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

export const getUnspentTxs = async ({ haskoinUrl, network, address }: AddressParams): Promise<TxUnspent[]> => {
  const account = await getAccount({ haskoinUrl, network, address })

  // Haskoin pages unspents; limit must be the UTXO count to return all of them
  const result: TxUnspent[] | ErrorResponse = (
    await axios.get(`${haskoinUrl}/${network}/address/${address}/unspent?limit=${account?.utxo}`)
  ).data
  if (!result || isErrorResponse(result)) throw new Error('failed to query unspent transactions')
  return result
}

export const getIsTxConfirmed = async ({ haskoinUrl, network, txId }: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ haskoinUrl, network, txId })
  return {
    network: network,
    txid: txId,
    confirmations: tx.confirmations,
    is_confirmed: tx.confirmations >= 1,
  }
}

// Confirmed tx hashes, cached so the same status is not requested again
const confirmedTxs: Array<TxHash> = []

export const getConfirmedTxStatus = async ({
  txHash,
  haskoinUrl,
  network,
}: {
  haskoinUrl: string
  txHash: TxHash
  network: HaskoinNetwork
}): Promise<boolean> => {
  if (confirmedTxs.includes(txHash)) return true
  const { is_confirmed } = await getIsTxConfirmed({
    haskoinUrl,
    network,
    txId: txHash,
  })
  confirmedTxs.push(txHash)
  return is_confirmed
}

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

// Raw tx hex, cached so the same transaction is not requested again
const txHexMap: Record<TxHash, string> = {}
export const getTxHex = async ({ haskoinUrl, network, txId }: TxHashParams): Promise<string> => {
  let txHex = txHexMap[txId]
  if (!!txHex) return txHex
  txHex = await getRawTransaction({ haskoinUrl, txId: txId, network: network })
  txHexMap[txId] = txHex
  return txHex
}
export const getUnspentTransactions = async ({ haskoinUrl, network, address }: AddressParams): Promise<TxUnspent[]> => {
  const account = await getAccount({ haskoinUrl, network, address })

  // Haskoin pages unspents; limit must be the UTXO count to return all of them
  const result: TxUnspent[] | ErrorResponse = (
    await axios.get(`${haskoinUrl}/${network}/address/${address}/unspent?limit=${account?.utxo}`)
  ).data
  if (!result || isErrorResponse(result)) throw new Error('failed to query unspent transactions')
  return result
}

/**
 * Haskoin can return 500 for a valid broadcast, so the same tx is retried.
 * https://github.com/haskoin/haskoin-store/issues/25
 * https://github.com/xchainjs/xchainjs-lib/issues/492
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 500) {
        retries++
        await delay(200 * retries)
      } else {
        return Promise.reject(error)
      }
    }
  }

  return Promise.reject(new Error('Max retries exceeded'))
}
