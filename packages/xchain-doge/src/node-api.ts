import axios from 'axios'

import { BroadcastTxParams } from './types/common'

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

export const broadcastTxToBlockCypher = async ({ txHex, nodeUrl }: BroadcastTxParams): Promise<string> => {
  const response = (
    await axios.post(nodeUrl, {
      tx: txHex,
    })
  ).data

  return response.tx.hash
}
