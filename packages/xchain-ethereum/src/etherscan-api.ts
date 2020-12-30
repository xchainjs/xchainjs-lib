import axios from 'axios'
import { GasOracleResponse } from './types'

const getApiKeyQueryParameter = (apiKey?: string): string => (!!apiKey ? `&apiKey=${apiKey}` : '')

/**
 * SafeGasPrice, ProposeGasPrice And FastGasPrice returned in string-Gwei
 *
 * @see https://etherscan.io/apis#gastracker
 *
 * @param {string} baseUrl The etherscan node url.
 * @param {string} apiKey (optional) The etherscan API key.
 * @returns {GasOracleResponse} LastBlock, SafeGasPrice, ProposeGasPrice, FastGasPrice
 */
export const getGasOracle = (baseUrl: string, apiKey?: string): Promise<GasOracleResponse> => {
  const url = baseUrl + '/api?module=gastracker&action=gasoracle'

  return axios.get(url + getApiKeyQueryParameter(apiKey)).then((response) => response.data.result)
}
