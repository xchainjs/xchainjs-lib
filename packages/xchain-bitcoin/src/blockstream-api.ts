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
  try {
    if (network === 'mainnet') {
      const url = 'https://api.blockcypher.com/v1/btc/main/txs/push?token=595c24fa03fa44ca8221fb67839d16f4'
      const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify({ tx: txHex }),
        headers: {
          'content-type': 'application/json',
        },
      })
      const json = await response.json()
      if (response.status !== 201) {
        throw new Error(JSON.stringify(json))
      }
      return json.tx.hash
    }
    const url = network === 'testnet' ? `${blockstreamUrl}/testnet/api/tx` : `${blockstreamUrl}/api/tx`
    const txid: string = (await axios.post(url, txHex)).data
    return txid
  } catch (error) {
    return Promise.reject(error)
  }
}
