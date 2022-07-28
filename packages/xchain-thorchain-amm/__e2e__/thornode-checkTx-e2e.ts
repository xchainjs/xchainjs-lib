import { Network } from '@xchainjs/xchain-client'

import { Thornode } from '../src/utils/thornode'

const thornode = new Thornode(Network.Mainnet)

const liveHash = '489614FDFFB7BAF93DB0FF6716157BBCE27CC050193AA330FD808C9EAB23DFD9'

describe('xchain-swap doSwap Integration Tests', () => {
  it(`Should check a live tx and return the stage`, async () => {
    const checkTx = await thornode.checkTx(liveHash)
    expect(checkTx).toBeTruthy()
    console.log(`Tx stage ${checkTx.stage}\nTx seconds left ${checkTx.seconds}`)
  })
})
