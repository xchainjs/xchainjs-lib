import { Network } from '@xchainjs/xchain-client'

import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { Midgard } from '../src/utils/midgard'

const midgard = new Midgard(Network.Mainnet)
const thorchainCache = new ThorchainCache(midgard)

const thorchainQuery = new ThorchainQuery(thorchainCache)
const liveHash = '489614FDFFB7BAF93DB0FF6716157BBCE27CC050193AA330FD808C9EAB23DFD9'

describe('Thorchain query checkTx Integration Tests', () => {
  it(`Should check a live tx and return the stage`, async () => {
    const checkTx = await thorchainQuery.checkTx(liveHash)
    expect(checkTx).toBeTruthy()
    console.log(`Tx stage ${checkTx.stage}\nTx seconds left ${checkTx.seconds}`)
  })
})
