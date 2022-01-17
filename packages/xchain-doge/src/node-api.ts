import axios from 'axios'

import { BroadcastTxParams } from './types/common'

/**
 * Broadcast transaction.
 *
 * @see https://sochain.com/api/#send-transaction
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTxToSochain = async ({ txHex, nodeUrl }: BroadcastTxParams): Promise<string> => {
  const response = (
    await axios.post(nodeUrl, {
      tx_hex: txHex,
    })
  ).data
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.data.txid
}

/**
 * Broadcast transaction.
 *
 * @see https://www.blockcypher.com/dev/bitcoin/#push-raw-transaction-endpoint
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTxToBlockCypher = async ({ txHex, nodeUrl }: BroadcastTxParams): Promise<string> => {
  const response = (
    await axios.post(nodeUrl, {
      tx: txHex,
    })
  ).data
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.tx.hash
}
