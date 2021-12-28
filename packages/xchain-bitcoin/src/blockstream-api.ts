import { Network } from '@xchainjs/xchain-client'
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
  const url = (() => {
    switch (network) {
      case Network.Mainnet:
        return `${blockstreamUrl}/api/tx`
      case Network.Testnet:
        return `${blockstreamUrl}/testnet/api/tx`
      case Network.Stagenet:
        // stagenet is not configured, default to mainnet value
        return `${blockstreamUrl}/api/tx`
    }
  })()
  const txid: string = (await axios.post(url, txHex)).data
  return txid
}
