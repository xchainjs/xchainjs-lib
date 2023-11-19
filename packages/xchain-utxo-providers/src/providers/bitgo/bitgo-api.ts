import axios from 'axios'

import { GetFeeEstimateRequest, GetFeeEstimateResponse } from './bitgo-api-types'

export const getFeeEstimate = async (
  baseUrl: string,
  request: GetFeeEstimateRequest,
): Promise<GetFeeEstimateResponse> => {
  const response = await axios.get<GetFeeEstimateResponse>(`${baseUrl}/tx/fee`, { params: request })

  return response.data
}
