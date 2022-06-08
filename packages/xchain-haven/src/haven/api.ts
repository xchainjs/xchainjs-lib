import axios from 'axios'
import {
  ApiAddressInfoResponse,
  ApiAddressTxsResponse,
  ApiLoginResponse,
  ApiPingResponse,
  ApiRandomOutsResponse,
  ApiTxResponse,
  ApiUnspentOutsResponse,
  ApiVersionResponse,
} from 'haven-core-js'

export const dataAPI = axios.create()

let API_URL = ''
let address = ''
let view_key = ''

export const setAPI_URL = (url: string) => {
  API_URL = url
}

export const setCredentials = (address_string: string, viewKey: string) => {
  address = address_string
  view_key = viewKey
}

const CONFIG = {
  Accept: 'application/json',
  headers: {
    'Content-Type': 'application/json',
  },
}

export const get_version = async (): Promise<ApiVersionResponse> => {
  const result = await dataAPI.post(`${API_URL}/get_version`, {}, CONFIG)
  return result.data
}

export const login = async (generated_locally: boolean, create_account = true): Promise<ApiLoginResponse> => {
  const params = { address, view_key, generated_locally, create_account }
  const result = await dataAPI.post(`${API_URL}/login`, params, CONFIG)
  return result.data
}

/**
 * ping the backend to keep the tx search thread on backend alive for this account
 */
export const keepAlive = async (): Promise<ApiPingResponse> => {
  const params = { address, view_key }
  const result = await dataAPI.post(`${API_URL}/ping`, params, CONFIG)
  return result.data
}

/**
 * get the list of all possible spendings, used when calculate the wallet balance
 */
export const getAddressInfo = async (): Promise<ApiAddressInfoResponse> => {
  const params = { address, view_key }
  return dataAPI.post(`${API_URL}/get_address_info`, params, CONFIG).then((result) => result.data)
}

/**
 * return all txs for account ( for the scanned block height )
 */
export const getAddressTxs = async (): Promise<ApiAddressTxsResponse> => {
  const params = { address, view_key }
  return dataAPI.post(`${API_URL}/get_address_txs`, params, CONFIG).then((result) => result.data)
}

/**
 * returns tx pf given hash
 * @param tx_hash
 */
export const getTx = async (tx_hash: string): Promise<ApiTxResponse> => {
  const params = { address, view_key, tx_hash }
  return dataAPI.post(`${API_URL}/get_tx`, params, CONFIG).then((result) => result.data)
}

// API endpoints for sending funds
// params are prepared by haven-core-js
export const getUnspentOuts = async (getUnspentOutsParams: unknown): Promise<ApiUnspentOutsResponse> => {
  return dataAPI.post(`${API_URL}/get_unspent_outs`, getUnspentOutsParams, CONFIG).then((result) => result.data)
}

export const getRandomOuts = async (getRandomOutsParams: unknown): Promise<ApiRandomOutsResponse> => {
  return dataAPI.post(`${API_URL}/get_random_outs`, getRandomOutsParams, CONFIG).then((result) => result.data)
}

export const submitRawTx = async (signedTx: unknown): Promise<null> => {
  return dataAPI.post(`${API_URL}/submit_raw_tx`, signedTx, CONFIG).then((result) => result.data)
}
