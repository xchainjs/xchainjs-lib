import { Network } from '@xchainjs/xchain-client'

import { Thornode } from '../src/utils/thornode'

const thornode = new Thornode(Network.Mainnet)

describe(`Thornode transaction status tests`, () => {
  it(`Should return txData`, async () => {
    const txStatus = await thornode.getTxData('276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52')
    expect(txStatus).toBeTruthy()
  })
  it(`Should return txStatus`, async () => {
    const txStatus = await thornode.checkTx('276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52')
    console.log(`Stage: ${txStatus.stage} \n Seconds: ${txStatus.seconds}`)
    expect(txStatus).toBeTruthy()
  })
})
