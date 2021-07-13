import { Network } from '@xchainjs/xchain-client'
import axios from 'axios'

import { BroadcastTxParams } from './types/common'

const blockstreamUrl = 'https://blockstream.info'
/**
 * Broadcast transaction.
 *
 * @see https://github.com/Blockstream/esplora/blob/master/API.md#post-tx
 *
 * @param {string} params
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ network, txHex }: BroadcastTxParams): Promise<string> => {
  const url = (() => {
    switch (network) {
      case Network.Mainnet:
        return `${blockstreamUrl}/api/tx`
      case Network.Testnet:
        return `${blockstreamUrl}/testnet/api/tx`
    }
  })()
  const txid: string = (await axios.post(url, txHex)).data
  return txid
}
