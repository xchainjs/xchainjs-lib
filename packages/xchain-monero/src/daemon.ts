/**
 * Monero daemon HTTP JSON-RPC client.
 * Provides raw RPC calls without depending on monero-ts.
 */

interface JsonRpcResponse<T> {
  id: string
  jsonrpc: string
  result: T
}

interface FeeEstimateResult {
  fee: number
  quantization_mask: number
  status: string
}

interface TxEntry {
  tx_hash: string
  as_hex: string
  block_height: number
  block_timestamp: number
  in_pool: boolean
}

interface GetTransactionsResponse {
  txs: TxEntry[]
  status: string
}

interface SendRawTxResponse {
  status: string
  reason?: string
  double_spend: boolean
}

async function jsonRpc<T>(url: string, method: string, params?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${url}/json_rpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: '0',
      method,
      params: params ?? {},
    }),
  })

  if (!response.ok) {
    throw new Error(`Daemon RPC error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as JsonRpcResponse<T>
  return data.result
}

async function httpPost<T>(url: string, path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Daemon HTTP error: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

/**
 * Get fee estimate from daemon.
 * Returns fee per byte in piconero.
 */
export const getFeeEstimate = async (url: string): Promise<number> => {
  const result = await jsonRpc<FeeEstimateResult>(url, 'get_fee_estimate')
  return result.fee
}

/**
 * Get transaction details by hash(es).
 */
export const getTransactions = async (url: string, txHashes: string[]): Promise<TxEntry[]> => {
  const result = await httpPost<GetTransactionsResponse>(url, '/get_transactions', {
    txs_hashes: txHashes,
    decode_as_json: false,
  })
  return result.txs ?? []
}

/**
 * Get outputs by global indices (for building ring members).
 */
export interface OutputEntry {
  key: string
  mask: string
  unlocked: boolean
  height: number
  txid: string
}

export const getOuts = async (url: string, outputs: { amount: number; index: number }[]): Promise<OutputEntry[]> => {
  const result = await httpPost<{ outs: OutputEntry[]; status: string }>(url, '/get_outs', {
    outputs,
    get_txid: true,
  })
  if (result.status !== 'OK') throw new Error(`get_outs failed: ${result.status}`)
  return result.outs
}

/**
 * Get output distribution for decoy selection.
 */
export const getOutputDistribution = async (
  url: string,
  fromHeight = 0,
  toHeight = 0,
): Promise<{ distribution: number[]; startHeight: number; base: number }> => {
  const result = await jsonRpc<{
    distributions: { distribution: { amount: number; data: number[]; start_height: number; base: number } }[]
    status: string
  }>(url, 'get_output_distribution', {
    amounts: [0],
    cumulative: true,
    from_height: fromHeight,
    to_height: toHeight,
  })
  const dist = result.distributions[0].distribution
  return { distribution: dist.data, startHeight: dist.start_height, base: dist.base }
}

/**
 * Get current blockchain height.
 */
export const getHeight = async (url: string): Promise<number> => {
  const result = await jsonRpc<{ count: number; status: string }>(url, 'get_block_count')
  return result.count
}

/**
 * Get block data at a specific height, including transaction hashes.
 */
export interface BlockHeader {
  height: number
  timestamp: number
  num_txes: number
}

interface GetBlockResult {
  blob: string
  block_header: BlockHeader
  tx_hashes: string[]
  status: string
}

export const getBlock = async (url: string, height: number): Promise<{ header: BlockHeader; txHashes: string[] }> => {
  const result = await jsonRpc<GetBlockResult>(url, 'get_block', { height })
  return { header: result.block_header, txHashes: result.tx_hashes ?? [] }
}

/**
 * Get transactions with decoded JSON for output scanning.
 */
export interface DecodedTxEntry {
  tx_hash: string
  as_json: string
  block_height: number
  block_timestamp: number
  in_pool: boolean
}

export const getTransactionsDecoded = async (url: string, txHashes: string[]): Promise<DecodedTxEntry[]> => {
  if (txHashes.length === 0) return []
  const result = await httpPost<{ txs: DecodedTxEntry[]; status: string }>(url, '/get_transactions', {
    txs_hashes: txHashes,
    decode_as_json: true,
  })
  return result.txs ?? []
}

/**
 * Get block headers for a range of heights in a single RPC call.
 */
export interface BlockHeaderEntry {
  height: number
  timestamp: number
  num_txes: number
}

export const getBlockHeadersRange = async (
  url: string,
  startHeight: number,
  endHeight: number,
): Promise<BlockHeaderEntry[]> => {
  const result = await jsonRpc<{ headers: BlockHeaderEntry[]; status: string }>(url, 'get_block_headers_range', {
    start_height: startHeight,
    end_height: endHeight,
  })
  return result.headers ?? []
}

/**
 * Get block tx hashes for a specific height.
 * Returns just the tx_hashes array (excludes miner tx).
 */
export const getBlockTxHashes = async (
  url: string,
  height: number,
): Promise<{ txHashes: string[]; timestamp: number }> => {
  const result = await jsonRpc<{ block_header: { timestamp: number }; tx_hashes: string[]; status: string }>(
    url,
    'get_block',
    { height },
  )
  return { txHashes: result.tx_hashes ?? [], timestamp: result.block_header.timestamp }
}

/**
 * Broadcast a raw transaction hex to the network.
 */
export const sendRawTransaction = async (url: string, txHex: string): Promise<SendRawTxResponse> => {
  const result = await httpPost<SendRawTxResponse>(url, '/send_raw_transaction', {
    tx_as_hex: txHex,
    do_not_relay: false,
  })

  if (result.status !== 'OK') {
    throw new Error(`Broadcast failed: ${result.reason ?? result.status}`)
  }

  return result
}
