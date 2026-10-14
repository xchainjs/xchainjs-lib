import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AddressUTXO,
  BalanceParams,
  BroadcastDTO,
  GetAddressInfo,
  StatusDTO,
  Transaction,
  TxHashParams,
} from './nownodes-api-types'

export const getTx = async ({ apiKey, baseUrl, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${baseUrl}/tx/${hash}`
  const response = await axios.get(url, {
    headers: {
      'api-key': apiKey,
    },
  })
  const tx: Transaction = response.data
  return tx
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
}): Promise<Transaction[]> => {
  const url = `${baseUrl}/address/${address}`
  const response = await axios.get(url, {
    params: {
      details: 'txs',
      pageSize: limit,
    },
    headers: {
      'api-key': apiKey,
    },
  })
  const txs: GetAddressInfo = response.data
  return txs.transactions as Transaction[]
}

export const getUTXOs = async ({
  apiKey,
  address,
  baseUrl,
  isConfirmed = true,
}: {
  apiKey: string
  address: string
  baseUrl: string
  isConfirmed: boolean
}): Promise<AddressUTXO[]> => {
  const url = `${baseUrl}/utxo/${address}`
  const response = await axios.get(url, {
    params: {
      confirmed: isConfirmed,
    },
    headers: {
      'api-key': apiKey,
    },
  })
  const utxos: AddressUTXO[] = response.data
  return utxos
}

export const getBalance = async ({
  apiKey,
  baseUrl,
  address,
  confirmedOnly = true,
  assetDecimals,
}: BalanceParams): Promise<BaseAmount> => {
  const url = `${baseUrl}/address/${address}`
  const response = await axios.get(url, {
    headers: {
      'api-key': apiKey,
    },
  })
  const balanceResponse: GetAddressInfo = response.data
  const balance = confirmedOnly
    ? baseAmount(balanceResponse.balance, assetDecimals)
    : baseAmount(balanceResponse.balance).plus(balanceResponse.unconfirmedBalance, assetDecimals)
  return balance
}

/**
 * Blockbook returns this at the API root as `backend.consensus.nextblock` (8 hex digits, e.g. "5437f330").
 * Zcash v5 signatures must use the active upgrade's branch ID or they become invalid after a consensus change.
 * `baseUrl` already includes `/api/v2`.
 */
export const getConsensusBranchId = async ({
  apiKey,
  baseUrl,
}: {
  apiKey: string
  baseUrl: string
}): Promise<number | undefined> => {
  const response = await axios.get(baseUrl, {
    headers: {
      'api-key': apiKey,
    },
    timeout: 10_000, // fail fast so the caller can fall back to the default branch ID
  })
  const nextblock = (response.data as StatusDTO).backend?.consensus?.nextblock
  // A consensus branch ID is a 32-bit value, always exactly 8 hex digits. Reject anything
  // else rather than risk signing with a malformed branch ID parsed from a partial match.
  if (!nextblock || !/^[0-9a-fA-F]{8}$/.test(nextblock)) return undefined
  return parseInt(nextblock, 16)
}

export const broadcastTx = async ({
  apiKey,
  baseUrl,
  txHex,
}: {
  apiKey: string
  baseUrl: string
  txHex: string
}): Promise<TxHash> => {
  const url = `${baseUrl}/sendtx/${txHex}`
  const response = await axios.get(url, {
    headers: {
      'api-key': apiKey,
    },
  })
  return (response.data as BroadcastDTO).result
}
