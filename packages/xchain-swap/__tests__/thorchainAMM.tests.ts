import { Network } from '@xchainjs/xchain-client'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRuneNative, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { LiquidityPool } from '../src'
import { ThorchainAMM } from '../src/ThorchainAMM'
import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const midgard = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgard)

const bnbPoolDetails = {
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
  beforeEach(() => {
    mockMidgardApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
  })

  // ThorchainAMM unit tests with mock data
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = assetToBase(assetAmount(1))
    const outBoundValue = await thorchainAmm.outboundDelay(bnbPool, AssetBNB, outboundAmount)
    console.log(outBoundValue)
    expect(outBoundValue).toEqual(1500)
  })

  it(`Should convert BTC to ETH `, async () => {
    const inputAsset: Asset = AssetBTC
    const outboundAsset: Asset = AssetETH
    const inputAmount = assetToBase(assetAmount(0.5))
    const outboundETHAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    console.log(
      `${inputAmount.amount()} ${inputAsset.chain} to ${
        outboundAsset.chain
      } is: ${outboundETHAmount.amount().toFixed()} ${outboundAsset.chain}`,
    )
    expect(outboundETHAmount.amount()).toBeTruthy()
  })

  it(`Should convert BTC to RUNE `, async () => {
    const inputAsset = AssetBTC
    const outboundAsset = AssetRuneNative
    const inputAmount = assetToBase(assetAmount(0.5))
    const outboundRuneAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    expect(outboundRuneAmount.amount().toNumber() > 1000)
  })
})
