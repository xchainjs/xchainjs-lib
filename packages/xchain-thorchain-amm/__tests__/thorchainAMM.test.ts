import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Asset, CryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainAMM } from '../src/thorchain-amm'

const thorchainQuery = new ThorchainQuery()
const thorchainAmm = new ThorchainAMM()
thorchainAmm

describe('ThorchainAmm Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterAll(() => {
    mockThornodeApi.restore()
    mockThornodeApi.restore()
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const outboundAsset: Asset = AssetETH
    const outboundETHAmount = await thorchainQuery.convert(input, outboundAsset)
    const EthAmount = new CryptoAmount(assetToBase(assetAmount('6.36639806')), AssetETH)
    expect(outboundETHAmount.assetAmount.amount().toFixed()).toEqual(EthAmount.assetAmount.amount().toFixed())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundRuneAmount = await thorchainQuery.convert(input, outboundAsset)
    const expectedAmount = new CryptoAmount(assetToBase(assetAmount('10420.94599452')), AssetRuneNative)
    expect(outboundRuneAmount.assetAmount.amount()).toEqual(expectedAmount.assetAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const outboundAsset: Asset = AssetBTC
    const outboundBTCAmount = await thorchainQuery.convert(input, outboundAsset)
    const expectedAmount = new CryptoAmount(assetToBase(assetAmount('959606')), AssetBTC)
    expect(outboundBTCAmount.baseAmount.amount()).toEqual(expectedAmount.assetAmount.amount())
  })
})
