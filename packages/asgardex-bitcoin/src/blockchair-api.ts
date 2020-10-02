import axios from 'axios'
import {
  BlockChairResponse,
  BtcAddressDTO,
  BtcChainOptions,
  Transactions,
  RawTxsBTC,
  ChainStatsBtc,
} from './types/blockchair-api-types'

/**
 * https://blockchair.com/api/docs#link_200
 * @param chain
 * @param hash
 */
export const getTx = async (chain: BtcChainOptions, hash: string): Promise<Transactions> => {
  try {
    const response = await axios.get(`https://api.blockchair.com/${chain}/dashboards/transaction/${hash}`)
    const txs: BlockChairResponse<Transactions> = response.data
    return txs.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_201
 * @param chain
 * @param hash
 */
export const getRawTx = async (chain: BtcChainOptions, hash: string): Promise<RawTxsBTC> => {
  try {
    const response = await axios.get(`// https://api.blockchair.com/${chain}/raw/transaction/${hash}`)
    const txs: BlockChairResponse<RawTxsBTC> = response.data
    return txs.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_300
 * @param chain
 * @param address
 */
export const getAddress = async (chain: BtcChainOptions, address: string): Promise<BtcAddressDTO> => {
  try {
    const response = await axios.get(`https://api.blockchair.com/${chain}/dashboards/address/${address}`)
    const addressResponse: BlockChairResponse<BtcAddressDTO> = response.data
    return addressResponse.data
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_202
 * @param chain
 * @param txHex
 */
export const broadcastTx = async (chain: BtcChainOptions, txHex: string): Promise<string> => {
  try {
    const response = await axios.post(`https://api.blockchair.com/${chain}/push/transaction`, { data: txHex })
    return response.data.data.transaction_hash
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * https://blockchair.com/api/docs#link_001
 * @param chain
 */
export const bitcoinStats = async (chain: BtcChainOptions): Promise<ChainStatsBtc> => {
  try {
    const response = await axios.get(`https://api.blockchair.com/${chain}/stats`)
    const bcRes: BlockChairResponse<ChainStatsBtc> = response.data
    return bcRes.data
  } catch (error) {
    return Promise.reject(error)
  }
}
