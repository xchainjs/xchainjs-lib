import axios from 'axios'

import { BroadcastTxParams } from './types/common'
import { TxBroadcastResponse } from './types/node-api-types'

/**
 * Broadcasts a transaction to the blockchain network.
 *
 * @see https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html
 * @param {BroadcastTxParams} params Parameters for broadcasting the transaction.
 * @returns {Promise<string>} The transaction ID if successful.
 */
export const broadcastTx = async ({ txHex, auth, nodeUrl }: BroadcastTxParams): Promise<string> => {
  const uniqueId = new Date().getTime().toString() // Generates a unique ID for the request
  const postData = {
    jsonrpc: '2.0',
    method: 'sendrawtransaction',
    params: [txHex],
    id: uniqueId,
  }

  let response: TxBroadcastResponse
  // Posts the transaction data to the specified node URL, optionally with authentication
  if (auth) {
    response = (await axios.post(nodeUrl, postData, { auth })).data
  } else {
    response = (await axios.post(nodeUrl, postData)).data
  }

  // Throws an error if the response contains an error message
  if (response.error) {
    throw new Error(`Failed to broadcast the transaction: ${response.error}`)
  }

  // Returns the transaction ID from the response result
  return response.result
}
