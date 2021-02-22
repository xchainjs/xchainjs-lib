import axios from 'axios'
import { TxBroadcastResponse } from './types/bitaps-api-types'
import { BroadcastTxParams } from './types/common'

/**
 * Broadcast transaction.
 *
 * @see https://github.com/Blockstream/esplora/blob/master/API.md#post-tx
 *
 * @param {string} params
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ network, txHex, bitapsUrl }: BroadcastTxParams): Promise<string> => {
  try {
    const url = network === 'testnet' ? `${bitapsUrl}/ltc/testnet/native` : `${bitapsUrl}/ltc/native`
    const uniqueId = new Date().getTime().toString() // for unique id
    const response: TxBroadcastResponse = (
      await axios.post(url, {
        jsonrpc: '1.0',
        id: uniqueId,
        method: 'sendrawtransaction',
        params: [txHex],
      })
    ).data
    if (response.error) {
      throw new Error(`failed to broadcast a transaction: ${response.error}`)
    }

    return response.result
  } catch (error) {
    return Promise.reject(error)
  }
}
