import { Address } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import { BTC_DECIMAL } from './const'
import { getIsTxConfirmed } from './sochain-api'

const HASKOIN_API_URL = 'https://api.haskoin.com/btc'
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

export const getBalance = async (address: string): Promise<BaseAmount> => {
  const {
    data: { confirmed, unconfirmed },
  } = await axios.get<BalanceData>(`${HASKOIN_API_URL}/address/${address}/balance`)

  const confirmedAmount = baseAmount(confirmed, BTC_DECIMAL)
  const unconfirmedAmount = baseAmount(unconfirmed, BTC_DECIMAL)

  return confirmedAmount.plus(unconfirmedAmount)
}

export const getUnspentTxs = async (address: string): Promise<UtxoData[]> => {
  const { data: response } = await axios.get<UtxoData[]>(`${HASKOIN_API_URL}/address/${address}/unspent`)

  return response
}

export const getConfirmedUnspentTxs = async (address: string): Promise<UtxoData[]> => {
  const allUtxos = await getUnspentTxs(address)

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
}
