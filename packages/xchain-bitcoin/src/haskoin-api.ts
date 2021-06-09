import axios from 'axios'

import { getIsTxConfirmed } from './sochain-api'
import { assetToBase, assetAmount, BaseAmount } from '@xchainjs/xchain-util'
import { BTC_DECIMAL } from './utils'
import { AddressParams } from './types/sochain-api-types'

const HASKOIN_API_URL = 'https://api.haskoin.com/btc'
const SOCHAIN_API_URL = 'https://sochain.com/api/v2'

export type UtxoData = {
  txid: string
  index: number
  value: number
  pkscript: string
}

export const getBalance = async (params: AddressParams): Promise<BaseAmount> => {
  const response = await axios.get(`${HASKOIN_API_URL}/address/balances?addresses=${params.address}`)
  const amounts = response.data[0]
  const confirmed = assetAmount(amounts.confirmed, BTC_DECIMAL)
  const unconfirmed = assetAmount(amounts.unconfirmed, BTC_DECIMAL)
  const netAmt = confirmed.amount().plus(unconfirmed.amount())
  const result = assetToBase(assetAmount(netAmt, BTC_DECIMAL))

  return result
}
export const getUnspentTxs = async (address: string): Promise<UtxoData[]> => {
  const { data: response } = await axios.get(`${HASKOIN_API_URL}/address/${address}/unspent`)

  return response
}

export const getConfirmedUnspentTxs = async (address: string): Promise<UtxoData[]> => {
  try {
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
  } catch (error) {
    return Promise.reject(error)
  }
}
