import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  BalanceParams,
  BlockcypherNetwork,
  BroadcastDTO,
  ChainResponse,
  GetBalanceDTO,
  GetTxsDTO,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
} from './blockcypher-api-types'

export const getTx = async ({ apiKey, baseUrl, network, hash, limit = 20 }: TxHashParams): Promise<Transaction> => {
  const params: Record<string, string> = { includeHex: 'true', limit: limit.toString() }
  if (apiKey) params['token'] = apiKey
  const url = `${baseUrl}/${network}/txs/${hash}`
  const response = await axios.get(url, { params })
  const tx: Transaction = response.data
  return tx
}

export const getTxs = async ({
  apiKey,
  address,
  baseUrl,
  network,
  beforeBlock,
  limit,
  unspentOnly,
}: {
  apiKey?: string
  address: string
  baseUrl: string
  network: BlockcypherNetwork
  limit: number
  beforeBlock?: number
  unspentOnly: boolean
}): Promise<GetTxsDTO> => {
  const params: Record<string, string> = { limit: `${limit}`, unspentOnly: `${unspentOnly}` }
  const url = `${baseUrl}/${network}/addrs/${address}`
  if (apiKey) params['token'] = apiKey
  if (beforeBlock) params['before'] = `${beforeBlock}`
  const response = await axios.get(url, { params })
  const txs: GetTxsDTO = response.data
  return txs
}
export const getBalance = async ({
  apiKey,
  baseUrl,
  network,
  address,
  confirmedOnly,
  assetDecimals,
}: BalanceParams): Promise<BaseAmount> => {
  const params: Record<string, string> = {}
  const url = `${baseUrl}/${network}/addrs/${address}/balance`
  if (apiKey) params['token'] = apiKey
  const response = await axios.get(url, { params })
  const balanceResponse: GetBalanceDTO = response.data
  const confirmedAmount = baseAmount(balanceResponse.balance, assetDecimals)
  const finalBalance = baseAmount(balanceResponse.final_balance, assetDecimals)
  return confirmedOnly ? confirmedAmount : finalBalance
}

export const getIsTxConfirmed = async ({
  apiKey,
  baseUrl,
  network,
  hash,
}: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ apiKey, baseUrl, network, hash })
  return {
    network: network,
    txid: hash,
    confirmations: !!tx.confirmed ? 1 : 0,
    is_confirmed: !!tx.confirmed,
  }
}

// Confirmed tx hashes, cached so the same status is not requested again
const confirmedTxs: Array<TxHash> = []

export const getConfirmedTxStatus = async ({
  apiKey,
  txHash,
  baseUrl,
  network,
}: {
  apiKey?: string
  baseUrl: string
  txHash: TxHash
  network: BlockcypherNetwork
}): Promise<boolean> => {
  if (confirmedTxs.includes(txHash)) return true
  const { is_confirmed } = await getIsTxConfirmed({
    apiKey,
    baseUrl,
    network,
    hash: txHash,
  })
  confirmedTxs.push(txHash)
  return is_confirmed
}

export const broadcastTx = async ({
  apiKey,
  baseUrl,
  network,
  txHex,
}: {
  apiKey?: string
  baseUrl: string
  txHex: string
  network: BlockcypherNetwork
}): Promise<TxHash> => {
  const params: Record<string, string> = {}
  const url = `${baseUrl}/${network}/txs/push`
  if (apiKey) params['token'] = apiKey
  const response = await axios.post(url, { tx: txHex }, { params })
  const broadcastResponse: BroadcastDTO = response.data
  return broadcastResponse.tx.hash
}

export const getBlockchainData = async ({
  baseUrl,
  apiKey,
}: {
  baseUrl: string
  apiKey?: string
}): Promise<ChainResponse> => {
  const params: Record<string, string> = {}
  if (apiKey) params['token'] = apiKey
  const chainResponse = await axios.get<ChainResponse>(`${baseUrl}`, { params })
  return chainResponse.data
}
