import { Network } from '@xchainjs/xchain-client'

import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))

const thorchainQuery = new ThorchainQuery(thorchainCache)
const liveHash = '0A21838668F385FE0BCCF4CA5B2AD868E8B81725FE3B52251A4CC17A0D87B80E'

describe('Thorchain query checkTx Integration Tests', () => {
  it(`Should check a live tx and return the stage`, async () => {
    const checkTx = await thorchainQuery.checkTx(liveHash)
    console.log(`Tx stage ${checkTx.stage}\nTx seconds left ${checkTx.seconds}`)
    expect(checkTx).toBeTruthy()
  })
})
