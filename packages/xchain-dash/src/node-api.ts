import { TxHash } from '@xchainjs/xchain-client'
import { NodeAuth } from '@xchainjs/xchain-dash/src/client'
import axios from 'axios'

export type BroadcastTxParams = {
  txHex: string
  nodeUrl: string
  auth?: NodeAuth
}

type BroadcastTxResponse = {
  error: string
  txid: string
}

export const broadcastTx = async (params: BroadcastTxParams): Promise<TxHash> => {
  const uniqueId = new Date().getTime().toString()
  try {
    const response: BroadcastTxResponse = (
      await axios.post(
        `${params.nodeUrl}/tx/send`,
        {
          jsonrpc: '2.0',
          rawtx: [params.txHex],
          id: uniqueId,
        },
        {
          auth: params.auth,
          timeout: 30 * 1000,
        },
      )
    ).data
    if (response.error) {
      return Promise.reject(Error(`failed to broadcast a transaction: ${response.error}`))
    }
    return response.txid
  } catch (ex) {
    return Promise.reject(Error(`failed to broadcast a transaction caught: ${ex}`))
  }
}
