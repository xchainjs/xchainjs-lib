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
        auth,
      },
    )
  ).data
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.result
}

// TODO: Check this before production
/**
 * Broadcast transaction.
 *
 * @see https://sochain.com/api/#send-transaction
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTxToSochain = async ({ txHex, auth, nodeUrl }: BroadcastTxParams): Promise<string> => {
  const response = (
    await axios.post(
      nodeUrl,
      {
        tx_hex: txHex,
      },
      {
        auth,
      },
    )
  ).data
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.data.txid
}
