import nock from 'nock'

import { NodeInfoResponse } from '../src/types'

export const mockTendermintNodeInfo = (url: string, result: NodeInfoResponse) =>
  nock(url).get('/cosmos/base/tendermint/v1beta1/node_info').reply(200, result)
