import { Network } from '@xchainjs/xchain-client'

import { Thornode } from '../src/utils/thornode'

const thornode = new Thornode(Network.Mainnet)

const liveHash = '9BB55A70141EFD892781435803155C60DA74E973B34BE7A72C2041E8261BAA14'

describe('xchain-swap doSwap Integration Tests', () => {
  it(`Should check a live tx and return the stage`, async () => {
    const checkTx = await thornode.checkTx(liveHash)
    console.log(checkTx.stage, checkTx.seconds)
  })
})
