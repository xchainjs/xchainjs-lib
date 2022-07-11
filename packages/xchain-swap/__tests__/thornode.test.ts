import {Thornode} from '../src/utils/thornode'
import { Network } from '@xchainjs/xchain-client'


const thornode = new Thornode(Network.Mainnet)

describe(`Thornode transaction status tests`, () => {

  it(`Should return txData`, async () => {

    const txStatus = await thornode.getTxData("68E07D5A8985BFB0779C378D83CAF2F674971C6E89BBFE016C9E78E823DDFFB0")
    expect(txStatus).toBeTruthy()
  })
  it(`Should return txStatus`, async () => {
    const txStatus = await thornode.checkTx("68E07D5A8985BFB0779C378D83CAF2F674971C6E89BBFE016C9E78E823DDFFB0")
    console.log(txStatus.stage)
    expect(txStatus).toBeTruthy()
  })

})
