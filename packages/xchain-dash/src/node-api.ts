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
      },
    )
  ).data
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.result
}
