import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  GetAddressInfo,
  BalanceParams,
  BroadcastDTO,
  Transaction,
  TxHashParams,
  AddressUTXO,
  RawTransaction,
} from './nownodes-api-types'

/**
 * Get transaction by hash.
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async ({ apiKey, baseUrl, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${baseUrl}/tx/${hash}`
  const response = await axios.get(url, { 
    headers: {
      'api-key': apiKey,
    }
  })
  const tx: Transaction = response.data
  return tx
} 

/**
 * Get raw transaction data by hash (without standarize).
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} hash The transaction hash.
 * @returns {RawTransaction}
 */
export const getRawTx = async ({ apiKey, baseUrl, hash }: TxHashParams): Promise<RawTransaction> => {
  const url = `${baseUrl}/tx-specific/${hash}`
  const response = await axios.get(url, { 
    headers: {
      'api-key': apiKey,
    }
  })
  const tx: RawTransaction = response.data
  return tx
} 

/**
 * Get transactions
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
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
      pageSize: limit
    },
    headers: {
      'api-key': apiKey,
    }
  })
  const txs: GetAddressInfo = response.data
  return txs.transactions as Transaction[]
}

/**
 * Get UTXOs
 *
 * @param {string} baseUrl The nownodes blockbook URL.
 * @param {string} address address.
 * @returns {Transactions}
 */

export const getUTXOs = async ({
  apiKey,
  address,
  baseUrl,
  isConfirmed = true,
}: {
  apiKey: string
  address: string
  baseUrl: string
  isConfirmed: boolean,
}): Promise<AddressUTXO[]> => {
  const url = `${baseUrl}/utxo/${address}`
  const response = await axios.get(url, { 
    params: {
      confirmed: isConfirmed
    },
    headers: {
      'api-key': apiKey,
    }
  })
  const utxos: AddressUTXO[] = response.data
  console.log('utxos', utxos)
  return utxos
}

/**
 * Get address balance.
 *
 *
 * @param {string} baseUrl The sochain node url.
 * @param {string} address Address
 * @param {boolean} confirmedOnly Flag whether to get balances of confirmed txs only or for all
 * @returns {number}
 */
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
    }
  })
  const balanceResponse: GetAddressInfo = response.data
  const balance = confirmedOnly ? baseAmount(balanceResponse.balance, assetDecimals) : baseAmount(balanceResponse.balance).plus(balanceResponse.unconfirmedBalance, assetDecimals)
  return balance
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
    }
  })
  return (response.data as BroadcastDTO).result
}

/**
 * Get general information about a blockchain
 * @param {string} baseUrl The base url for the chain to interact with.
 * @param {string} apiKey API key provided by Blockcypher.
 * @returns {ChainResponse}
 */
// TODO: REIMPLEMENT
export const getBlockchainData = async ({
  baseUrl,
  apiKey,
}: {
  baseUrl: string
  apiKey: string
}): Promise<any> => {
  const url = baseUrl
  const response = await axios.get(url, { 
    headers: {
      'api-key': apiKey,
    }
  })
  return response.data
}
