import axios from 'axios'

// axios.interceptors.request.use((request) => {
//   // console.log('Starting Request', JSON.stringify(request, null, 2))
//   console.log(request.url)
//   return request
// })

// axios.interceptors.response.use((response) => {
//   console.log('Response:', JSON.stringify(response.data, null, 2))
//   //console.log(response.data)
//   return response
// })

/**
 * endpoints for openhaven/backend communication
 */

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

export const get_version = (): Promise<any> => {
  return dataAPI.post(`${API_URL}/get_version`, {}, CONFIG).then((result) => result.data)
}

export const login = (generated_locally: boolean, create_account = true): Promise<any> => {
  const params = { address, view_key, generated_locally, create_account }
  return dataAPI.post(`${API_URL}/login`, params, CONFIG).then((result) => result.data)
}

/**
 * ping the backend to keep the tx search thread on backend alive for this account
 * @param address
 * @param view_key
 */
export const keepAlive = (): Promise<any> => {
  const params = { address, view_key }
  return dataAPI.post(`${API_URL}/ping`, params, CONFIG).then((result) => result.data)
}

/**
 * get the list of all possible spendings, used when calculate the wallet balance
 * @param address
 * @param view_key
 */
export const getAddressInfo = (): Promise<any> => {
  const params = { address, view_key }
  return dataAPI.post(`${API_URL}/get_address_info`, params, CONFIG).then((result) => result.data)
}

/**
 * return all txs for account ( for the scanned block height )
 * @param address
 * @param view_key
 */
export const getAddressTxs = (): Promise<any> => {
  const params = { address, view_key }
  return dataAPI.post(`${API_URL}/get_address_txs`, params, CONFIG).then((result) => result.data)
}

/**
 * returns tx pf given hash
 * @param address
 * @param view_key
 * @param tx_hash
 */
export const getTx = (tx_hash: string): Promise<any> => {
  const params = { address, view_key, tx_hash }
  return dataAPI.post(`${API_URL}/get_tx`, params, CONFIG).then((result) => result.data)
}

//
// API endpoints for sending funds
// params are prepared by havenWallet
//

export const getUnspentOuts = (getUnspentOutsParams: any): Promise<any> => {
  //    const amount = 0;
  //    const mixin = 0;
  //    const use_dust = false;
  //    const dust_threshold = "1000000000";

  //const params = {address, view_key, amount, mixin, use_dust, dust_threshold};
  return dataAPI.post(`${API_URL}/get_unspent_outs`, getUnspentOutsParams, CONFIG).then((result) => result.data)
}

export const getRandomOuts = (getRandomOutsParams: any): Promise<any> => {
  return dataAPI.post(`${API_URL}/get_random_outs`, getRandomOutsParams, CONFIG).then((result) => result.data)
}

export const submitRawTx = (signedTx: any): Promise<any> => {
  return dataAPI.post(`${API_URL}/submit_raw_tx`, signedTx.CONFIG).then((result) => result.data)
}
