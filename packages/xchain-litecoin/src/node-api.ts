import axios from 'axios'
import { TxBroadcastResponse } from './types/node-api-types'
import { BroadcastTxParams } from './types/common'

/**
 * Broadcast transaction.
 *
 * @see https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ txHex, auth, nodeUrl }: BroadcastTxParams): Promise<string> => {
  try {
    const uniqueId = new Date().getTime().toString() // for unique id
    const response: TxBroadcastResponse = (
      await axios.post(
        nodeUrl,
        {
          jsonrpc: '2.0',
          method: 'sendrawtransaction',
          params: [txHex],
          id: uniqueId,
        },
        {
          auth: {
            username: auth.userName,
            password: auth.password,
          },
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
