const axios = require('axios').default

import { Utxos, Txs, Tx, Estimates, Blocks, Address } from './types/electrs-api-types'

export const getAddressUtxos = async (baseUrl: string, address: string): Promise<Utxos> => {
  try {
    const response = await axios.get(`${baseUrl}/address/${address}/utxo`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getAddressTxs = async (baseUrl: string, address: string): Promise<Txs> => {
  try {
    const response = await axios.get(`${baseUrl}/address/${address}/txs`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getFeeEstimates = async (baseUrl: string): Promise<Estimates> => {
  try {
    const response = await axios.get(`${baseUrl}/fee-estimates`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getBlocks = async (baseUrl: string, startHeight?: number): Promise<Blocks> => {
  try {
    const url = `${baseUrl}/blocks${startHeight ? `/${startHeight}` : ''}`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getTxInfo = async (baseUrl: string, txId: string): Promise<Tx> => {
  try {
    const response = await axios.get(`${baseUrl}/tx/${txId}`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getAddressInfo = async (baseUrl: string, address: string): Promise<Address> => {
  try {
    const response = await axios.get(`${baseUrl}/address/${address}`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const broadcastTx = async (baseUrl: string, txhex: string): Promise<string> => {
  try {
    const response = await axios.post(`${baseUrl}/tx`, txhex)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}
