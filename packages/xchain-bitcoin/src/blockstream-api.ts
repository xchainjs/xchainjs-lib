import axios from 'axios'
import { BroadcastTxParams } from './types/common'

/**
 * Broadcast transaction.
 *
 * @see https://github.com/Blockstream/esplora/blob/master/API.md#post-tx
 *
 * @param {string} params
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ network, txHex, blockstreamUrl }: BroadcastTxParams): Promise<string> => {
  const url = network === 'testnet' ? `${blockstreamUrl}/testnet/api/tx` : `${blockstreamUrl}/api/tx`
  const txid: string = (await axios.post(url, txHex)).data
  return txid
}
