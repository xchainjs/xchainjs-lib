/**
 * Module to interact with Haskoin API
 *
 * Doc (SwaggerHub) https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3
 *
 */

import { Network, TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios, { AxiosResponse } from 'axios'

import { BTC_DECIMAL } from './const'
import { getConfirmedTxStatus } from './sochain-api'
import type { BroadcastTxParams } from './types/common'
import type { BalanceData, UtxoData } from './types/haskoin-api-types'

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
  } = await axios.get<BalanceData>(`${haskoinUrl}/address/${address}/balance`)

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
  const { data: response } = await axios.get<UtxoData[]>(`${haskoinUrl}/address/${address}/unspent`)

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
 * @param {BroadcastTxParams} params
 * @returns {TxHash} Transaction hash.
 */
export const broadcastTx = async ({ txHex, haskoinUrl }: BroadcastTxParams): Promise<TxHash> => {
  const {
    data: { txid },
  } = await axios.post<string, AxiosResponse<{ txid: string }>>(`${haskoinUrl}/transactions`, txHex)
  return txid
}
