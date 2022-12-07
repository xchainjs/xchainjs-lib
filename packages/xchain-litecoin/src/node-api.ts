import axios, { AxiosInstance } from 'axios'

import { BroadcastTxParams } from './types/common'
import { TxBroadcastResponse } from './types/node-api-types'

let instance: AxiosInstance = axios.create()

export const setupInstance = (customRequestHeaders: Record<string, string>) => {
  instance = axios.create({ headers: customRequestHeaders })
}
/**
 * Broadcast transaction.
 *
 * @see https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html
 *
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ txHex, auth, nodeUrl }: BroadcastTxParams): Promise<string> => {
  const uniqueId = new Date().getTime().toString() // for unique id
  const postData = {
    jsonrpc: '2.0',
    method: 'sendrawtransaction',
    params: [txHex],
    id: uniqueId,
  }
  let response: TxBroadcastResponse
  if (auth) {
    response = (await instance.post(nodeUrl, postData, { auth })).data
  } else {
    response = (await instance.post(nodeUrl, postData)).data
  }
  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`)
  }

  return response.result
}
