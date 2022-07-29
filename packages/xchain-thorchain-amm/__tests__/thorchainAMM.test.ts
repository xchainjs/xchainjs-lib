import { Network } from '@xchainjs/xchain-client'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRuneNative, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ThorchainCache } from '../src'
import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainAMM } from '../src/thorchain-amm'
import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const midgardts = new Midgard(Network.Mainnet)
const thorchainCache = new ThorchainCache(midgardts)
const thorchainAmm = new ThorchainAMM(thorchainCache)

describe('ThorchainAmm Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
  })

  // ThorchainAMM unit tests with mock data
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB)

    const outBoundValue = await thorchainAmm.outboundDelay(outboundAmount)
    const expectedOutput = 1500
    expect(outBoundValue).toEqual(expectedOutput)
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const outboundAsset: Asset = AssetETH
    const outboundETHAmount = await thorchainAmm.convert(input, outboundAsset)
    const EthAmount = assetToBase(assetAmount('15'))
    expect(outboundETHAmount.baseAmount.amount().toFixed()).toEqual(EthAmount.amount().toFixed())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundRuneAmount = await thorchainAmm.convert(input, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(10))
    expect(outboundRuneAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const outboundAsset: Asset = AssetBTC
    const outboundBTCAmount = await thorchainAmm.convert(input, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(10))
    expect(outboundBTCAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })
})
