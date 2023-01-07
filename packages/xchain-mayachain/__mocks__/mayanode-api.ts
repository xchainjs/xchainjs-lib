import nock from 'nock'

import { NodeInfoResponse, SimulateResponse } from '../src/types'

export const mockTendermintNodeInfo = (url: string, result: NodeInfoResponse) =>
  nock(url).get('/cosmos/base/tendermint/v1beta1/node_info').reply(200, result)

export const mockTendermintSimulate = (url: string, result: SimulateResponse) =>
  nock(url).post('/cosmos/tx/v1beta1/simulate').reply(200, result)
