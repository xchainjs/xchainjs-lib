import { TxHash } from '@xchainjs/xchain-client/lib'
import axios from 'axios'

import { TxBroadcastParams, TxBroadcastResponse } from './types'

/**
 * Broadcast transaction.
 *
 * @see https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ txHex, auth, nodeUrl }: TxBroadcastParams): Promise<TxHash> => {
  const id = new Date().getTime().toString()

  console.log('broadcastTx txHex:', txHex)
  console.log('broadcastTx nodeUrl:', nodeUrl)
  console.log('broadcastTx username:', auth?.username)
  console.log('broadcastTx password:', auth?.password)

  const response: TxBroadcastResponse = (
    await axios.post(
      nodeUrl,
      {
        jsonrpc: '2.0',
        method: 'sendrawtransaction',
        params: [txHex],
        id,
      },
      {
        auth,
      },
    )
  ).data

  console.log('response error:', response.error)
  console.log('response result:', response.result)
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.result
}
