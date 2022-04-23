/**
 * endpoints for openhaven/backend communication
 */

const API_URL = 'EMPTY'

const INIT_REQUEST = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
}

export const login = (address: string, view_key: string, generated_locally: string, create_account = true) => {
  const params = { address, view_key, generated_locally, create_account }
  return fetch(`${API_URL}/login`, { ...INIT_REQUEST, body: JSON.stringify(params) }).then((result) => result.json())
}

/**
 * ping the backend to keep the tx search thread on backend alive for this account
 * @param address
 * @param view_key
 */
export const keepAlive = (address: string, view_key: string) => {
  const params = { address, view_key }
  return fetch(`${API_URL}/ping`, { ...INIT_REQUEST, body: JSON.stringify(params) }).then((result) => result.json())
}

/**
 * get the list of all possible spendings, used when calculate the wallet balance
 * @param address
 * @param view_key
 */
export const getAddressInfo = (address: string, view_key: string) => {
  const params = { address, view_key }
  return fetch(`${API_URL}/get_address_info`, { ...INIT_REQUEST, body: JSON.stringify(params) }).then((result) =>
    result.json(),
  )
}

/**
 * return all txs for account ( for the scanned block height )
 * @param address
 * @param view_key
 */
export const getAddressTxs = (address: string, view_key: string) => {
  const params = { address, view_key }
  return fetch(`${API_URL}/get_address_txs`, { ...INIT_REQUEST, body: JSON.stringify(params) }).then((result) =>
    result.json(),
  )
}

//
// API endpoints for sending funds
// params are prepared by havenWallet
//

export const getUnspentOuts = (getUnspentOutsParams: any) => {
  //    const amount = 0;
  //    const mixin = 0;
  //    const use_dust = false;
  //    const dust_threshold = "1000000000";

  //const params = {address, view_key, amount, mixin, use_dust, dust_threshold};
  return fetch(`${API_URL}/get_unspent_outs`, {
    ...INIT_REQUEST,
    body: JSON.stringify(getUnspentOutsParams),
  }).then((result) => result.json())
}

export const getRandomOuts = (getRandomOutsParams: any) => {
  return fetch(`${API_URL}/get_random_outs`, {
    ...INIT_REQUEST,
    body: JSON.stringify(getRandomOutsParams),
  }).then((result) => result.json())
}

export const submitRawTx = (signedTx: any) => {
  return fetch(`${API_URL}/submit_raw_tx`, { ...INIT_REQUEST, body: JSON.stringify(signedTx) }).then((result) =>
    result.json(),
  )
}
