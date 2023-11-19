import axios from 'axios'

import { GetFeeEstimateRequest, GetFeeEstimateResponse } from './bitgo-api-types'

/**
 * Returns the estimated fee for a transaction. UTXO coins will return a fee per kB
 * @param {string} baseUrl Bitgo base url of chain to interact with. For example: https://app.bitgo.com/api/v2/btc
 * @param {GetFeeEstimateRequest} request Get fee estimate params
 * @returns {GetFeeEstimateResponse} Get fee estimate response
 */
export const getFeeEstimate = async (
  baseUrl: string,
  request: GetFeeEstimateRequest,
): Promise<GetFeeEstimateResponse> => {
  const response = await axios.get<GetFeeEstimateResponse>(`${baseUrl}/tx/fee`, { params: request })

  return response.data
}
