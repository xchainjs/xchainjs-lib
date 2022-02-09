/**
 * Module to interact with Haskoin API
 *
 * Doc (SwaggerHub) https://app.swaggerhub.com/apis/eligecode/blockchain-api/0.0.1-oas3
 *
 */

import { Network } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import { BTC_DECIMAL } from './const'
import { getIsTxConfirmed } from './sochain-api'
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
      const { is_confirmed: isTxConfirmed } = await getIsTxConfirmed({
        sochainUrl,
        network,
        hash: tx.txid,
      })

      if (isTxConfirmed) {
        confirmedUTXOs.push(tx)
      }
    }),
  )

  return confirmedUTXOs
}
