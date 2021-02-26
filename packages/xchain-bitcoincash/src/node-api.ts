import axios from 'axios'
import uniqid from 'uniqid'
import { TxBroadcastResponse, TxBroadcastParams } from './types'

/**
 * Broadcast transaction.
 *
 * @see https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ txHex, auth, nodeUrl }: TxBroadcastParams): Promise<string> => {
  try {
    const response: TxBroadcastResponse = (
      await axios.post(
        nodeUrl,
        {
          jsonrpc: '2.0',
          method: 'sendrawtransaction',
          params: [txHex],
          id: uniqid(),
        },
        {
          auth,
        },
      )
    ).data
    if (response.error) {
      throw new Error(`failed to broadcast a transaction: ${response.error}`)
    }

    return response.result
  } catch (error) {
    return Promise.reject(error)
  }
}
