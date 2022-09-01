import axios from 'axios'
import {TxHash} from "@xchainjs/xchain-client";
import {NodeAuth} from "@xchainjs/xchain-dash/src/client";

export type BroadcastTxParams = {
  txHex: string
  nodeUrl: string
  auth?: NodeAuth
}

type BroadcastTxResponse = {
  error: string,
  result: string,
}

export const broadcastTx = async (params: BroadcastTxParams): Promise<TxHash> => {
  const uniqueId = new Date().getTime().toString()
  try {
    const response: BroadcastTxResponse = (
      await axios.post(
        params.nodeUrl,
        {
          jsonrpc: '2.0',
          method: 'sendrawtransaction',
          params: [params.txHex],
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
    return response.result
  } catch (ex) {
    return Promise.reject(Error(`failed to broadcast a transaction: ${ex?.response?.data?.error?.message}`))
  }
}
