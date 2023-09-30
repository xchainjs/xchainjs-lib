import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'

import { ThorchainAMM } from '../src/thorchain-amm'

const thorchainQueryMainnet = new ThorchainQuery()
const mainetThorchainAmm = new ThorchainAMM(thorchainQueryMainnet)

describe('Thorchain-amm thornames', () => {
  it(`Should get all thornames by address`, async () => {
    const thornames = await mainetThorchainAmm.getThornamesByAddress('0xc50531811f3d8161a2b53349974ae4c7c6d3bfba')
    console.log('thornames', thornames)
  })
})
