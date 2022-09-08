import { Network } from '@xchainjs/xchain-client'

import mockThornodeApi from '../__mocks__/thornode-api'
import { Thornode } from '../src/utils/thornode'

const thornode = new Thornode(Network.Mainnet)

describe(`Thornode transaction status tests`, () => {
  beforeEach(() => {
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockThornodeApi.restore()
  })
  const txResp = `276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52`
  // const txStageOne = `276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC` // fake hash, tx not seen by thornodes

  // const stageOneResponse: TxStatus = {
  //   stage: TxStage.INBOUND_CHAIN_UNCONFIRMED,
  //   seconds: 60,
  // }

  it(`Should return thornode txData from hash and match chain btc`, async () => {
    const txStatus = await thornode.getTxData(txResp)
    expect(txStatus.observed_tx?.tx.chain).toEqual('BTC')
  })

  it(`Should return get scheduled Queue`, async () => {
    const getscheduledQueue = await thornode.getscheduledQueue()
    expect(getscheduledQueue).toBeTruthy()
    expect(getscheduledQueue[0].chain).toEqual('BNB')
  })

  it(`Should return get last block`, async () => {
    const lastBlock = await thornode.getLastBlock()
    expect(lastBlock).toBeTruthy()
    expect(lastBlock[0].chain).toEqual('BCH')
  })

  // it(`Should not pass stage 1 and return tx status for test undefined chain`, async () => {
  //   const stageOne = await thornode.checkTx(txStageOne)
  //   expect(stageOne).toBeTruthy()
  //   expect(stageOne).toEqual(stageOneResponse)
  // })
  // it(`Should not pass stage 1 and return tx status for test defined chain`, async () => {
  //   const stageOne = await thornode.checkTx(txStageOne, BTCChain)
  //   expect(stageOne).toBeTruthy()
  //   expect(stageOne.stage).toEqual(stageOneResponse.stage)
  // })
})
