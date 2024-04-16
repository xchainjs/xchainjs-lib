import { TxHash } from '@xchainjs/xchain-client'
import axios from 'axios'

import { NodeAuth } from './types'

/**
 * Parameters for broadcasting a transaction.
 */
export type BroadcastTxParams = {
  txHex: string // The hexadecimal representation of the transaction to be broadcasted.
  nodeUrl: string // The URL of the node where the transaction will be broadcasted.
  auth?: NodeAuth // Optional authentication credentials for the node.
}

/**
 * Response structure for broadcasting a transaction.
 */
type BroadcastTxResponse = {
  error: string // Error message if the transaction broadcast fails.
  txid: string // The transaction ID if the transaction is successfully broadcasted.
}

/**
 * Function to broadcast a transaction to the Dash network.
 *
 * @param {BroadcastTxParams} params Parameters for broadcasting the transaction.
 * @returns {Promise<TxHash>} Promise that resolves with the transaction hash if successful, or rejects with an error message if unsuccessful.
 */
export const broadcastTx = async (params: BroadcastTxParams): Promise<TxHash> => {
  const uniqueId = new Date().getTime().toString() // Generate a unique identifier for the transaction request.
  try {
    const response: BroadcastTxResponse = (
      await axios.post(
        `${params.nodeUrl}/tx/send`, // URL endpoint for broadcasting the transaction.
        {
          jsonrpc: '2.0',
          rawtx: [params.txHex], // Include the hexadecimal transaction in the request body.
          id: uniqueId,
        },
        {
          auth: params.auth, // Include authentication credentials if provided.
          timeout: 30 * 1000, // Set a timeout for the request.
        },
      )
    ).data
    if (response.error) {
      // If there is an error in the response, reject the promise with the error message.
      return Promise.reject(Error(`failed to broadcast a transaction: ${response.error}`))
    }
    // If no error, return the transaction ID indicating successful broadcast.
    return response.txid
  } catch (ex) {
    // If an exception occurs during the request, reject the promise with the caught error message.
    return Promise.reject(Error(`failed to broadcast a transaction caught: ${ex}`))
  }
}
