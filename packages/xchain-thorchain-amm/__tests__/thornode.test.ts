import { Network } from '@xchainjs/xchain-client'
import { BTCChain } from '@xchainjs/xchain-util'

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
  const txResp = `276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52`
  const txStageOne = `276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC` // fake hash, tx not seen by thornodes
  const txStageTwo = `E64875F5EF8B4EA94900EC86E7790A40D5397ED0AEAFA68EEB05964CAFB18BAE`
  const txStageTwoPart2 = `28833B25B58B1907A3E4171E991DEB5E168A98829810F1215E0959D59BDD7CF5`
  const txStageThree = '276CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F52'
  const txStageFour = '776CE5005FF822294773C549E74513636808A6A9817FE7ADCE1709EE06BC7F53'

  const stageOneResponse: TxStatus = {
    stage: TxStage.INBOUND_CHAIN_UNCONFIRMED,
    seconds: 60,
  }
  const stageTwoResponse: TxStatus = {
    stage: TxStage.CONF_COUNTING,
    seconds: 4200,
  }
  const stageTwoResponsePart2: TxStatus = {
    stage: TxStage.TC_PROCESSING,
    seconds: 6,
  }
  const stageThreeResponse: TxStatus = {
    stage: TxStage.OUTBOUND_QUEUED,
    seconds: 6,
  }
  const stageFourResponse: TxStatus = {
    stage: TxStage.OUTBOUND_CHAIN_UNCONFIRMED,
    seconds: 6,
  }

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

  it(`Should not pass stage 1 and return tx status for test undefined chain`, async () => {
    const stageOne = await thornode.checkTx(txStageOne)
    expect(stageOne).toBeTruthy()
    expect(stageOne).toEqual(stageOneResponse)
  })
  it(`Should not pass stage 1 and return tx status for test defined chain`, async () => {
    const stageOne = await thornode.checkTx(txStageOne, BTCChain)
    expect(stageOne).toBeTruthy()
    expect(stageOne.stage).toEqual(stageOneResponse.stage)
  })
  it(`Should test stage 2 and return TxStatus with seconds matching chain * block difference`, async () => {
    const stageTwo = await thornode.checkTx(txStageTwo, BTCChain)
    expect(stageTwo).toEqual(stageTwoResponse)
  })
  it(`Should test stage 2 and return TxStatus with stage matching TC processing`, async () => {
    const stageTwo = await thornode.checkTx(txStageTwoPart2)
    expect(stageTwo).toEqual(stageTwoResponsePart2)
  })
  it(`Should test stage 3 and return TxStatus with`, async () => {
    const stageTwo = await thornode.checkTx(txStageThree)
    expect(stageTwo).toEqual(stageThreeResponse)
  })
  it(`Should test stage 3 and return TxStatus with`, async () => {
    const stageTwo = await thornode.checkTx(txStageFour)
    expect(stageTwo).toEqual(stageFourResponse)
  })
})
