import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { CryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import mockThornodeApi from '../__mocks__/mayachain/mayanode/api'
import mockMayaMidgardApi from '../__mocks__/mayachain/midgard/api'
import mockThorMidgardApi from '../__mocks__/thorchain/midgard/api'
import mockMayanodeApi from '../__mocks__/thorchain/thornode/api'
import { Aggregator } from '../src'

describe('Aggregator', () => {
  let aggregator: Aggregator

  beforeAll(() => {
    aggregator = new Aggregator()
    mockThornodeApi.init()
    mockThorMidgardApi.init()
    mockMayanodeApi.init()
    mockMayaMidgardApi.init()
  })

  afterAll(() => {
    mockThornodeApi.restore()
    mockThorMidgardApi.restore()
    mockMayanodeApi.restore()
    mockMayaMidgardApi.restore()
  })

  it('Should find swap with greatest expected amount', async () => {
    const txEstimated = await aggregator.estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), AssetBTC),
    })
    expect(txEstimated.expectedAmount.assetAmount.amount().toString()).toBe('17.70607901')
  })
})
