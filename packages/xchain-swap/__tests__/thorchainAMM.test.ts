import { Network } from '@xchainjs/xchain-client'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRuneNative, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { LiquidityPool } from '../src'
import { ThorchainAMM } from '../src/ThorchainAMM'
import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const midgardts = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgardts)

const bnbPoolDetails = {
  annualPercentageRate: '1.1865336252957166',
  asset: 'BNB.BNB',
  assetDepth: assetToBase(assetAmount(100)).amount().toFixed(),
  assetPrice: '11121.24920535084',
  assetPriceUSD: '30458.124870650492',
  liquidityUnits: '536087715332333',
  poolAPY: '0.1001447237777584',
  runeDepth: assetToBase(assetAmount(2500000)).amount().toFixed(),
  status: 'available',
  synthSupply: '3304301605',
  synthUnits: '10309541238596',
  units: '546397256570929',
  volume24h: '16202006480711',
}

const bnbPool = new LiquidityPool(bnbPoolDetails)

describe('Midgard Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
  })

  // ThorchainAMM unit tests with mock data
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = assetToBase(assetAmount(1))
    const outBoundValue = await thorchainAmm.outboundDelay(bnbPool, AssetBNB, outboundAmount)
    const expectedOutput = 1500
    expect(outBoundValue).toEqual(expectedOutput)
  })

  it(`Should convert BTC to ETH `, async () => {
    const inputAsset: Asset = AssetBTC
    const outboundAsset: Asset = AssetETH
    const inputAmount = assetToBase(assetAmount(0.5))
    const outboundETHAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    const EthAmount = assetToBase(assetAmount(9.1362964))
    expect(outboundETHAmount.amount()).toEqual(EthAmount.amount())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const inputAsset: Asset = AssetBTC
    const outboundAsset: Asset = AssetRuneNative
    const inputAmount = assetToBase(assetAmount(0.5))
    const outboundRuneAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(4760.13797319))
    expect(outboundRuneAmount.amount()).toEqual(expectedAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const inputAsset: Asset = AssetRuneNative
    const outboundAsset: Asset = AssetBTC
    const inputAmount = assetToBase(assetAmount(100))
    const outboundBTCAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(0.010504))
    expect(outboundBTCAmount.amount()).toEqual(expectedAmount.amount())
  })
})
