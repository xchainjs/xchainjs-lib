import { Network } from '@xchainjs/xchain-client'
import {
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { LiquidityPool } from '../src/liquidity-pool'
import { ThorchainCache } from '../src/thorchain-cache'
import { SwapOutput } from '../src/types'
import { Midgard } from '../src/utils/midgard'
import {
  getDoubleSwap,
  //getDoubleSwap,
  getDoubleSwapFee,
  getDoubleSwapOutput,
  getDoubleSwapSlip,
  getSingleSwap,
  getSwapFee,
  getSwapOutput,
  getSwapSlip,
} from '../src/utils/swap'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))

const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('Asset is incorrect')

const btcPoolDetails = {
  annualPercentageRate: '0.053737568449651274',
  asset: 'BTC.BTC',
  assetDepth: new CryptoAmount(assetToBase(assetAmount(100)), AssetBTC).baseAmount.amount().toString(),
  assetPrice: '25000',
  assetPriceUSD: '30458.124870650492',
  liquidityUnits: '536087715332333',
  nativeDecimal: '8',
  poolAPY: '0.1001447237777584',
  runeDepth: new CryptoAmount(assetToBase(assetAmount(2500000)), AssetRuneNative).baseAmount.amount().toString(),
  status: 'available',
  synthSupply: '3304301605',
  synthUnits: '10309541238596',
  units: '546397256570929',
  volume24h: '16202006480711',
}
const ethPoolDetails = {
  annualPercentageRate: '0.09731470549045307',
  asset: 'ETH.ETH',
  assetDepth: new CryptoAmount(assetToBase(assetAmount(9100)), AssetETH).baseAmount.amount().toString(),
  assetPrice: '680.10989011',
  assetPriceUSD: '1817.6139097932505',
  liquidityUnits: '262338362121353',
  nativeDecimal: '18',
  poolAPY: '0.10844053560303157',
  runeDepth: new CryptoAmount(assetToBase(assetAmount(6189000)), AssetRuneNative).baseAmount.amount().toString(),
  status: 'available',
  synthSupply: '11035203002',
  synthUnits: '1634889648287',
  units: '263973251769640',
  volume24h: '8122016881297',
}

const btcPool = new LiquidityPool(btcPoolDetails, 8)
const ethPool = new LiquidityPool(ethPoolDetails, 8)

const inputAmount = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)

describe('Swap Cal Tests', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterAll(() => {
    mockMidgardApi.restore()
    mockThornodeApi.restore()
  })
  it('should calculate correct swap output', async () => {
    const swapOutputValue = getSwapOutput(inputAmount, btcPool, true)
    const correctOutput = new CryptoAmount(assetToBase(assetAmount(24507.40123517)), AssetRuneNative)
    expect(swapOutputValue.baseAmount.amount()).toEqual(correctOutput.baseAmount.amount()) // output in RUNE
  })
  it('should calculate correct slip percentage', async () => {
    const slip = getSwapSlip(inputAmount, btcPool, true)
    const correctSlip = 0.00990099009900990099009900990099 // 1/101 0.99 % slip.
    expect(slip.toNumber()).toEqual(correctSlip)
  })

  it('should calculate correct swap fee', async () => {
    const swapFee = getSwapFee(inputAmount, btcPool, true)
    const expectedSlipFee = new CryptoAmount(assetToBase(assetAmount(245.07401235)), AssetRuneNative)
    expect(swapFee.baseAmount.amount()).toEqual(expectedSlipFee.baseAmount.amount())
  })

  it('Should calculate correct get single swap object', async () => {
    const singleSwap = getSingleSwap(inputAmount, btcPool, true)
    const correctOutput: SwapOutput = {
      output: new CryptoAmount(assetToBase(assetAmount(24507.40123517)), AssetRuneNative),
      swapFee: new CryptoAmount(assetToBase(assetAmount(245.07401235)), AssetRuneNative),
      slip: new BigNumber(0.00990099009900990099),
    }
    expect(singleSwap.output.assetAmount.amount()).toEqual(correctOutput.output.assetAmount.amount())
    expect(singleSwap.swapFee.assetAmount.amount()).toEqual(correctOutput.swapFee.assetAmount.amount())
    expect(singleSwap.slip.toFixed(8)).toEqual(correctOutput.slip.toFixed(8))
  })

  it('should calculate correct double swap', async () => {
    const doubleSwapOutput = getDoubleSwapOutput(inputAmount, btcPool, ethPool)
    const expectedDoubleSwapOutput = new CryptoAmount(assetToBase(assetAmount(35.75077791)), AssetETH)
    expect(doubleSwapOutput.assetAmount.amount().toFixed(8)).toEqual(
      expectedDoubleSwapOutput.assetAmount.amount().toFixed(8),
    )
  })

  it('Should calculate correct double swap slip', async () => {
    const doubleSwapOutputSlip = getDoubleSwapSlip(inputAmount, btcPool, ethPool)
    const correctDoubleSwapOutputSlip = new BigNumber(0.0138452)
    expect(doubleSwapOutputSlip.toFixed(8)).toEqual(correctDoubleSwapOutputSlip.toFixed(8))
  })

  it('Should calculate correct double swap fee', async () => {
    const doubleSwapOutputFee = await getDoubleSwapFee(inputAmount, btcPool, ethPool, thorchainCache)
    const correctdoubleSwapOutputFee = new CryptoAmount(baseAmount('36836378668'), AssetRuneNative)
    expect(doubleSwapOutputFee.baseAmount.amount().toFixed(0)).toEqual(
      correctdoubleSwapOutputFee.baseAmount.amount().toFixed(0),
    )
  })

  it(`Should calculate double swap object`, async () => {
    const doubleswap = await getDoubleSwap(inputAmount, btcPool, ethPool, thorchainCache)

    const correctOutput: SwapOutput = {
      output: new CryptoAmount(assetToBase(assetAmount(35.75077791)), AssetETH),
      swapFee: new CryptoAmount(assetToBase(assetAmount(368.36378668)), AssetRuneNative),
      slip: new BigNumber(0.0138452),
    }
    expect(doubleswap.output.assetAmount.amount()).toEqual(correctOutput.output.assetAmount.amount())
    expect(doubleswap.swapFee.assetAmount.amount()).toEqual(correctOutput.swapFee.assetAmount.amount())
    expect(doubleswap.slip.toFixed(8)).toEqual(correctOutput.slip.toFixed(8))
  })

  it(`Should calculate double swap with BUSD`, async () => {
    const BTCpool = await thorchainCache.getPoolForAsset(AssetBTC)
    const BUSDPool = await thorchainCache.getPoolForAsset(BUSD)
    const doubleswap = await getDoubleSwap(inputAmount, BTCpool, BUSDPool, thorchainCache)

    const correctOutput: SwapOutput = {
      output: new CryptoAmount(assetToBase(assetAmount(21634.28119885)), BUSD),
      swapFee: new CryptoAmount(assetToBase(assetAmount(38.30357049)), AssetRuneNative),
      slip: new BigNumber(0.0035276),
    }

    expect(doubleswap.output.assetAmount.amount()).toEqual(correctOutput.output.assetAmount.amount())
    expect(doubleswap.swapFee.assetAmount.amount()).toEqual(correctOutput.swapFee.assetAmount.amount())
    expect(doubleswap.slip.toFixed(8)).toEqual(correctOutput.slip.toFixed(8))
  })
})
