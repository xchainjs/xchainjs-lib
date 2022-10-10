import { Network } from '@xchainjs/xchain-client'

import { ThorchainCache } from '../src/thorchain-cache'
import { CheckTx } from '../src/thorchain-checktx'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))

const checkTx = new CheckTx(thorchainCache)
const liveHash = [
  '0000000000000000000000000000000000000000000000000000000000000000', // unkown transaction
  //'3087DD1E7D0148C98B594059D03B5EA438FD8AA9D8500CF8F3D759F1ABA8676F', // THOR in and ETH Out
  //  '991DFE33AC4482CC7A1E3BF1142E121A315EED18ED8E8FDDDC678E8F176DFCBA', // THOR in, ETH out
  '619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC', // BTC in, Synth BTC out
]

describe('Thorchain query checkTx Integration Tests', () => {
  it(`Should c and return the stage`, async () => {
    await checkTx.checkTx(liveHash[0])
    expect(checkTx).toBeTruthy()
    // await checkTx.checkTx(liveHash[1])
    // expect(checkTx).toBeTruthy()
  })
})
