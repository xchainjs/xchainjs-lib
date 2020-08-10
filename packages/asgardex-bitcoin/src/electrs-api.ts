const axios = require('axios').default

export const getAddressUtxos = async (baseUrl: string, address: string): Promise<any> => {
  try {
    const response = await axios.get(`${baseUrl}/address/${address}/utxo`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getAddressTxs = async (baseUrl: string, address: string): Promise<any> => {
  try {
    const response = await axios.get(`${baseUrl}/address/${address}/txs`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getFeeEstimates = async (baseUrl: string): Promise<any> => {
  try {
    const response = await axios.get(`${baseUrl}/fee-estimates`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getBlocks = async (baseUrl: string, startHeight?: number): Promise<any> => {
  try {
    const url = `${baseUrl}/blocks${startHeight ? `/${startHeight}` : ''}`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getTxInfo = async (baseUrl: string, txId: string): Promise<any> => {
  try {
    const response = await axios.get(`${baseUrl}/tx/${txId}`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getAddressInfo = async (baseUrl: string, address: string): Promise<any> => {
  try {
    const response = await axios.get(`${baseUrl}/address/${address}`)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}
