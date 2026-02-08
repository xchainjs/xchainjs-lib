import axios from 'axios'
import { JSONRPCClient } from 'json-rpc-2.0'

import { Config, UTXO } from './types'

const RPC_TIMEOUT = 30_000 // 30 seconds

function makeClient(config: Config): JSONRPCClient {
  const client = new JSONRPCClient(async (jsonRPCRequest) => {
    const response = await axios.post(config.server.host, jsonRPCRequest, {
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: config.server.user,
        password: config.server.password,
      },
      timeout: RPC_TIMEOUT,
    })
    client.receive(response.data)
  })
  return client
}

export async function getUTXOS(from: string, config: Config): Promise<UTXO[]> {
  const client = makeClient(config)
  const utxos = await client.request('getaddressutxos', [from])
  return utxos
}

export async function waitForTransaction(txid: string, config: Config, maxAttempts = 30): Promise<void> {
  const client = makeClient(config)
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const tx = await client.request('gettransaction', [txid])
      if (tx && tx.confirmations > 0) {
        return
      }
    } catch {
      // Transaction might not be in wallet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Transaction ${txid} not confirmed after ${maxAttempts} attempts`)
}

export async function sendRawTransaction(txb: Buffer, config: Config): Promise<string> {
  try {
    // Direct axios call to get better error details
    const response = await axios.post(
      config.server.host,
      {
        jsonrpc: '2.0',
        method: 'sendrawtransaction',
        params: [txb.toString('hex')],
        id: 1,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: config.server.user,
          password: config.server.password,
        },
        timeout: RPC_TIMEOUT,
      },
    )
    if (response.data.error) {
      console.error('RPC Error:', response.data.error)
      throw new Error(response.data.error.message)
    }
    return response.data.result
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: { message: string } } } }
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error.message)
    }
    throw error
  }
}
