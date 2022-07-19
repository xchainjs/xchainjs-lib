import { Network } from '@xchainjs/xchain-client'

import { Thornode, TxStage, TxStatus } from '../src/utils/thornode'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockThornodeApi from '../__mocks__/thornode-api'

const thornode = new Thornode(Network.Mainnet)

describe(`Thornode transaction status tests`, () => {
  beforeEach(() => {
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockThornodeApi.restore()
  })
  const txBtcConfirmed = '276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52'
  const txStageOne = `276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC` // tx not seen by thornodes

  const StageOneResponse: TxStatus = {
    stage: TxStage.INBOUND_CHAIN_UNCONFIRMED,
    seconds: 0,
  }

  it(`Should return thornode txData from hash and match chain btc`, async () => {
    const txStatus = await thornode.getTxData(txBtcConfirmed)
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

  it(`Should not pass stage 1 and return status`, async () => {
    const stageOne = await thornode.checkTx(txStageOne)
    expect(stageOne).toBeTruthy()
    expect(stageOne).toEqual(StageOneResponse)
  })
})
