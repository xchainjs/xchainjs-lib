/**
 * Module to interact with Haskoin API
 *
 * Doc (SwaggerHub) https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3
 *
 */

import { Network, TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount, delay } from '@xchainjs/xchain-util'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

import { BTC_DECIMAL } from './const'
import { getConfirmedTxStatus } from './sochain-api'
import type { BroadcastTxParams } from './types/common'
import type { BalanceData, UtxoData } from './types/haskoin-api-types'

let instance: AxiosInstance = axios.create()

export const setupHaskoinInstance = (customRequestHeaders: Record<string, string>) => {
  instance = axios.create({ headers: customRequestHeaders })
}
export const getBalance = async ({
  haskoinUrl,
  address,
  confirmedOnly,
}: {
  haskoinUrl: string
  address: string
  confirmedOnly: boolean
}): Promise<BaseAmount> => {
  const {
    data: { confirmed, unconfirmed },
  } = await instance.get<BalanceData>(`${haskoinUrl}/address/${address}/balance`)

  const confirmedAmount = baseAmount(confirmed, BTC_DECIMAL)
  const unconfirmedAmount = baseAmount(unconfirmed, BTC_DECIMAL)

  return confirmedOnly ? confirmedAmount : confirmedAmount.plus(unconfirmedAmount)
}

export const getUnspentTxs = async ({
  haskoinUrl,
  address,
}: {
  haskoinUrl: string
  address: string
}): Promise<UtxoData[]> => {
  const { data: response } = await instance.get<UtxoData[]>(`${haskoinUrl}/address/${address}/unspent`)

  return response
}

export const getConfirmedUnspentTxs = async ({
  haskoinUrl,
  sochainUrl,
  address,
  network,
}: {
  haskoinUrl: string
  sochainUrl: string
  address: string
  network: Network
}): Promise<UtxoData[]> => {
  const allUtxos = await getUnspentTxs({ haskoinUrl, address })

  const confirmedUTXOs: UtxoData[] = []

  await Promise.all(
    allUtxos.map(async (tx: UtxoData) => {
      const confirmed = await getConfirmedTxStatus({
        sochainUrl,
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
    const config = error.config
    if (counter < MAX && error.response?.status === 500) {
      counter++
      await delay(200 * counter)
      return instance.request(config)
    }
    return Promise.reject(error)
  }
  // All logic for re-sending same tx is handled by Axios' response interceptor
  // https://github.com/axios/axios#interceptors
  const id = instance.interceptors.response.use(onFullfilled, onRejected)

  const url = `${haskoinUrl}/transactions`
  try {
    const {
      data: { txid },
    } = await instance.post<string, AxiosResponse<{ txid: string }>>(url, txHex)
    // clean up interceptor from axios instance
    instance.interceptors.response.eject(id)
    return txid
  } catch (error: unknown) {
    // clean up interceptor from axios instance
    instance.interceptors.response.eject(id)
    return Promise.reject(error)
  }
}
