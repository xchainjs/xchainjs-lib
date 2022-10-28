import axios from 'axios'

import { BroadcastTxParams } from './types/common'
import { TxBroadcastResponse } from './types/node-api-types'

/**
 * Broadcast transaction.
 *
 * @see https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ txHex, auth, nodeUrl }: BroadcastTxParams): Promise<string> => {
  const uniqueId = new Date().getTime().toString() // for unique id
  const postData = {
    jsonrpc: '2.0',
    method: 'sendrawtransaction',
    params: [txHex],
    id: uniqueId,
  }
  let response: TxBroadcastResponse
  if (auth) {
    response = (await axios.post(nodeUrl, postData, { auth })).data
  } else {
    response = (await axios.post(nodeUrl, postData)).data
  }
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.result
}
