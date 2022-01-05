import { Address } from '@thorwallet/xchain-client/lib'
import { BaseAmount, baseAmount } from '@thorwallet/xchain-util/lib'
import axios from 'axios'

import { getIsTxConfirmed } from './sochain-api'
import { BTC_DECIMAL } from './utils'

const SOCHAIN_API_URL = 'https://sochain.com/api/v2'

export type UtxoData = {
  txid: string
  index: number
  value: number
  pkscript: string
}

export type BalanceData = {
  address: Address
  confirmed: number
  unconfirmed: number
  utxo: number
  txs: number
  received: number
}

export const getBalance = async ({
  haskoinUrl,
  address,
}: {
  haskoinUrl: string
  address: string
}): Promise<BaseAmount> => {
  const {
    data: { confirmed, unconfirmed },
  } = await axios.get<BalanceData>(`${haskoinUrl}/address/${address}/balance`)

  const confirmedAmount = baseAmount(confirmed, BTC_DECIMAL)
  const unconfirmedAmount = baseAmount(unconfirmed, BTC_DECIMAL)

  return confirmedAmount.plus(unconfirmedAmount)
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
  address,
}: {
  haskoinUrl: string
  address: string
}): Promise<UtxoData[]> => {
  try {
    const allUtxos = await getUnspentTxs({ haskoinUrl, address })

    const confirmedUTXOs: UtxoData[] = []

    await Promise.all(
      allUtxos.map(async (tx: UtxoData) => {
        const { is_confirmed: isTxConfirmed } = await getIsTxConfirmed({
          sochainUrl: SOCHAIN_API_URL,
          network: 'mainnet',
          hash: tx.txid,
        })

        if (isTxConfirmed) {
          confirmedUTXOs.push(tx)
        }
      }),
    )

    return confirmedUTXOs
  } catch (error) {
    return Promise.reject(error)
  }
}
