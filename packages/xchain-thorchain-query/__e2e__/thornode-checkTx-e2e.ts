import { Network } from '@xchainjs/xchain-client'

import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))

const thorchainQuery = new ThorchainQuery(thorchainCache)
const liveHash = '991DFE33AC4482CC7A1E3BF1142E121A315EED18ED8E8FDDDC678E8F176DFCBA'

describe('Thorchain query checkTx Integration Tests', () => {
  it(`Should c and return the stage`, async () => {
    const checkTx = await thorchainQuery.checkTx(liveHash)
    console.log(`Tx stage ${checkTx.stage}\nTx seconds left ${checkTx.seconds}`)
    expect(checkTx).toBeTruthy()
  })
})
