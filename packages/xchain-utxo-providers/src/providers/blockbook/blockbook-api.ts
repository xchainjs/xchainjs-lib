import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AddressUTXO,
  BalanceParams,
  BroadcastDTO,
  FeeEstimateDTO,
  GetAddressInfo,
  Transaction,
  TxHashParams,
} from './blockbook-api-types'

const makeHeaders = (apiKey?: string) => (apiKey ? { 'api-key': apiKey } : {})

/** Path segment encoding: `:` is valid unencoded in paths (RFC 3986). Avoid `%3A` in URLs/logs while keeping other escapes. */
const encodeAddressPathSegment = (address: string) =>
  encodeURIComponent(address).replace(/%3A/g, ':')

export const getTx = async ({ apiKey, baseUrl, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${baseUrl}/tx/${hash}`
  const response = await axios.get(url, { headers: makeHeaders(apiKey) })
  return response.data as Transaction
}

export const getTxs = async ({
  apiKey,
  address,
  baseUrl,
  limit,
}: {
  apiKey?: string
  address: string
  baseUrl: string
  limit: number
}): Promise<{ transactions: Transaction[]; total: number }> => {
  const url = `${baseUrl}/address/${encodeAddressPathSegment(address)}`
  const response = await axios.get(url, {
    params: { details: 'txs', pageSize: limit },
    headers: makeHeaders(apiKey),
  })
  const info: GetAddressInfo = response.data
  return { transactions: (info.transactions as Transaction[]) ?? [], total: info.txs }
}

export const getUTXOs = async ({
  apiKey,
  address,
  baseUrl,
  isConfirmed = true,
}: {
  apiKey?: string
  address: string
  baseUrl: string
  isConfirmed?: boolean
}): Promise<AddressUTXO[]> => {
  const url = `${baseUrl}/utxo/${encodeAddressPathSegment(address)}`
  const response = await axios.get(url, {
    params: { confirmed: isConfirmed },
    headers: makeHeaders(apiKey),
  })
  return response.data as AddressUTXO[]
}

export const getBalance = async ({
  apiKey,
  baseUrl,
  address,
  confirmedOnly = true,
  assetDecimals,
}: BalanceParams): Promise<BaseAmount> => {
  const url = `${baseUrl}/address/${encodeAddressPathSegment(address)}`
  const response = await axios.get(url, { headers: makeHeaders(apiKey) })
  const info: GetAddressInfo = response.data
  return confirmedOnly
    ? baseAmount(info.balance, assetDecimals)
    : baseAmount(info.balance, assetDecimals).plus(baseAmount(info.unconfirmedBalance, assetDecimals))
}

export const broadcastTx = async ({
  apiKey,
  baseUrl,
  txHex,
}: {
  apiKey?: string
  baseUrl: string
  txHex: string
}): Promise<TxHash> => {
  const url = `${baseUrl}/sendtx/${txHex}`
  const response = await axios.get(url, { headers: makeHeaders(apiKey) })
  return (response.data as BroadcastDTO).result
}

/**
 * Fetches fee estimate using Blockbook's legacy REST endpoint.
 *
 * The V2 REST spec only exposes fee estimation via websocket. The documented
 * REST path is the legacy /api/v1/estimatefee/<blocks> route, which all
 * Blockbook instances support regardless of version.
 *
 * Docs: https://github.com/trezor/blockbook/blob/master/docs/api.md
 * (Legacy API V1 → GET /api/v1/estimatefee/<number of blocks>)
 *
 * @param numberOfBlocks Target block confirmation count
 * @returns Estimated fee rate in sat/byte
 */
export const getFeeEstimate = async ({
  apiKey,
  baseUrl,
  numberOfBlocks,
}: {
  apiKey?: string
  baseUrl: string
  numberOfBlocks: number
}): Promise<number> => {
  // Derive the V1 base by replacing /api/v2 suffix with /api/v1
  const v1Base = baseUrl.replace(/\/api\/v2\/?$/, '/api/v1')
  const url = `${v1Base}/estimatefee/${numberOfBlocks}`
  const response = await axios.get(url, { headers: makeHeaders(apiKey) })
  const dto: FeeEstimateDTO = response.data
  // result is in BTC/kB; convert to sat/byte
  return (parseFloat(dto.result) * 1e8) / 1000
}
