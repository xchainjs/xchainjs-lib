import axios from 'axios'

/**
 * endpoints for openhaven/backend communication
 */

let API_URL = ''

export const setAPI_URL = (url: string) => {
  API_URL = url
}

const CONFIG = {
  Accept: 'application/json',
  headers: {
    'Content-Type': 'application/json',
  },
}

export const get_version = (): Promise<any> => {
  return axios.post(`${API_URL}/get_version`, {}, CONFIG).then((result) => result.data)
}

export const login = (
  address: string,
  view_key: string,
  generated_locally: boolean,
  create_account = true,
): Promise<any> => {
  const params = { address, view_key, generated_locally, create_account }
  return axios.post(`${API_URL}/login`, params, CONFIG).then((result) => result.data)
}

/**
 * ping the backend to keep the tx search thread on backend alive for this account
 * @param address
 * @param view_key
 */
export const keepAlive = (address: string, view_key: string): Promise<any> => {
  const params = { address, view_key }
  return axios.post(`${API_URL}/ping`, params, CONFIG).then((result) => result.data)
}

/**
 * get the list of all possible spendings, used when calculate the wallet balance
 * @param address
 * @param view_key
 */
export const getAddressInfo = (address: string, view_key: string): Promise<any> => {
  const params = { address, view_key }
  return axios.post(`${API_URL}/get_address_info`, params, CONFIG).then((result) => result.data)
}

/**
 * return all txs for account ( for the scanned block height )
 * @param address
 * @param view_key
 */
export const getAddressTxs = (address: string, view_key: string): Promise<any> => {
  const params = { address, view_key }
  return axios.post(`${API_URL}/get_address_txs`, params, CONFIG).then((result) => result.data)
}

/**
 * returns tx pf given hash
 * @param address
 * @param view_key
 * @param tx_hash
 */
export const getTx = (address: string, view_key: string, tx_hash: string): Promise<any> => {
  const params = { address, view_key, tx_hash }
  return axios.post(`${API_URL}/get_tx`, params, CONFIG).then((result) => result.data)
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
  return axios.post(`${API_URL}/get_unspent_outs`, getUnspentOutsParams, CONFIG).then((result) => result.data)
}

export const getRandomOuts = (getRandomOutsParams: any): Promise<any> => {
  return axios.post(`${API_URL}/get_random_outs`, getRandomOutsParams, CONFIG).then((result) => result.data)
}

export const submitRawTx = (signedTx: any): Promise<any> => {
  return axios.post(`${API_URL}/submit_raw_tx`, signedTx.CONFIG).then((result) => result.data)
}
