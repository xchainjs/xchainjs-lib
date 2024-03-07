import { AssetBTC, BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { CryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { Aggregator } from '../src'

describe('Aggregator', () => {
  let aggregator: Aggregator
  beforeAll(() => {
    aggregator = new Aggregator()
  })

  it('Should find max amount output estimate swap', () => {
    aggregator.estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
    })
  })
})
