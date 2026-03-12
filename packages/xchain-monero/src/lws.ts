/**
 * MyMonero-compatible Light Wallet Server (LWS) REST API client.
 * LWS accepts private view keys and returns pre-decoded balances/transactions,
 * avoiding the need for client-side blockchain scanning.
 */

export interface LWSLoginResponse {
  new_address: boolean
  generated_locally: boolean
  start_height: number
}

export interface LWSSpentOutput {
  amount: string
  key_image: string
  tx_pub_key: string
  out_index: number
  mixin: number
}

export interface LWSAddressInfoResponse {
  locked_funds: string
  total_received: string
  total_sent: string
  scanned_height: number
  scanned_block_height: number
  start_height: number
  transaction_height: number
  blockchain_height: number
  spent_outputs: LWSSpentOutput[]
}

export interface LWSTxInfo {
  id: number
  hash: string
  timestamp: string
  total_received: string
  total_sent: string
  height: number
  spent_outputs: LWSSpentOutput[]
  payment_id: string
  coinbase: boolean
  mempool: boolean
  mixin: number
}

export interface LWSAddressTxsResponse {
  total_received: string
  scanned_height: number
  scanned_block_height: number
  start_height: number
  blockchain_height: number
  transactions: LWSTxInfo[]
}

export interface LWSUnspentOutput {
  amount: string
  public_key: string
  index: number
  global_index: number
  tx_id: number
  tx_hash: string
  tx_prefix_hash: string
  tx_pub_key: string
  timestamp: string
  height: number
  rct: string
}

export interface LWSUnspentOutsResponse {
  amount: string
  outputs: LWSUnspentOutput[]
  per_byte_fee: number
  fee_mask: number
  fork_version: number
}

async function lwsPost<T>(url: string, path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`LWS error: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

/**
 * Register wallet address with LWS for scanning.
 * Must be called before other endpoints will return data.
 */
export const login = async (url: string, address: string, viewKeyHex: string): Promise<LWSLoginResponse> => {
  return lwsPost<LWSLoginResponse>(url, '/login', {
    address,
    view_key: viewKeyHex,
    create_account: true,
    generated_locally: false,
  })
}

/**
 * Get balance summary for an address.
 * Returns total received/sent in piconero strings.
 */
export const getAddressInfo = async (
  url: string,
  address: string,
  viewKeyHex: string,
): Promise<LWSAddressInfoResponse> => {
  return lwsPost<LWSAddressInfoResponse>(url, '/get_address_info', {
    address,
    view_key: viewKeyHex,
  })
}

/**
 * Get transaction history for an address.
 * Returns transactions with per-tx received/sent amounts.
 */
export const getAddressTxs = async (
  url: string,
  address: string,
  viewKeyHex: string,
): Promise<LWSAddressTxsResponse> => {
  return lwsPost<LWSAddressTxsResponse>(url, '/get_address_txs', {
    address,
    view_key: viewKeyHex,
  })
}

/**
 * Get unspent outputs for transaction building.
 */
export const getUnspentOuts = async (
  url: string,
  address: string,
  viewKeyHex: string,
  amount: string = '0',
): Promise<LWSUnspentOutsResponse> => {
  return lwsPost<LWSUnspentOutsResponse>(url, '/get_unspent_outs', {
    address,
    view_key: viewKeyHex,
    amount,
    mixin: 15,
    use_dust: false,
    dust_threshold: '2000000000',
  })
}
