import axios from 'axios'
import { BroadcastTxParams } from './types/common'

/**
 * Broadcast transaction.
 *
 * @see https://sochain.com/api#send-transaction
 *
 * @param {string} network
 * @param {string} txHex
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ network, txHex, blockstreamUrl }: BroadcastTxParams): Promise<string> => {
  try {
    const url = network === 'testnet' ? `${blockstreamUrl}/testnet/api/tx` : `${blockstreamUrl}/api/tx`
    const txid: string = (await axios.post(url, txHex)).data
    return txid
  } catch (error) {
    return Promise.reject(error)
  }
}
