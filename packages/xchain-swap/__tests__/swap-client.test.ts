import { assetAmount, assetToBase, baseToAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../src/LiquidityPool'
import { SwapOutput } from '../src/types'
import {
  getDoubleSwap,
  getDoubleSwapFee,
  getDoubleSwapOutput,
  getDoubleSwapSlip,
  getSingleSwap,
  getSwapFee,
  getSwapOutput,
  getSwapSlip,
} from '../src/utils/swap'

const btcPoolDetails = {
  asset: 'BTC.BTC',
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
const ethPoolDetails = {
  asset: 'ETH.ETH',
  assetDepth: assetToBase(assetAmount(9100)).amount().toFixed(),
  assetPrice: '663.6697871509878',
  assetPriceUSD: '1817.6139097932505',
  liquidityUnits: '262338362121353',
  poolAPY: '0.10844053560303157',
  runeDepth: assetToBase(assetAmount(6189000)).amount().toFixed(),
  status: 'available',
  synthSupply: '11035203002',
  synthUnits: '1634889648287',
  units: '263973251769640',
  volume24h: '8122016881297',
}
const btcPool = new LiquidityPool(btcPoolDetails)
const ethPool = new LiquidityPool(ethPoolDetails)

const inputAmount = assetToBase(assetAmount(1)) // 1 BTC

describe('Swap Cal Tests', () => {
  it('should calculate correct swap output', async () => {
    const swapOutputValue = getSwapOutput(inputAmount, btcPool, true)
    const correctOutput = new BigNumber(24507.40123517)
    expect(baseToAsset(swapOutputValue).amount()).toEqual(correctOutput) // output in RUNE
  })
  it('should calculate correct slip percentage', async () => {
    const slip = getSwapSlip(inputAmount, btcPool, true)
    const correctSlip = 0.00990099009900990099009900990099 // 1/101 0.99 % slip.
    expect(slip.toNumber()).toEqual(correctSlip)
  })

  it('should calculate correct swap fee', async () => {
    const swapFee = getSwapFee(inputAmount, btcPool, true)
    const expectedSlipFee = new BigNumber(245.07401235)
    expect(baseToAsset(swapFee).amount()).toEqual(expectedSlipFee)
  })

  it('Should calculate correct get single swap object', async () => {
    const singleSwap = getSingleSwap(inputAmount, btcPool, true)
    const correctOutput: SwapOutput = {
      output: assetToBase(assetAmount(24507.40123517)),
      swapFee: assetToBase(assetAmount(245.07401235)),
      slip: new BigNumber(0.00990099009900990099),
    }
    expect(baseToAsset(singleSwap.output).amount()).toEqual(baseToAsset(correctOutput.output).amount())
    expect(baseToAsset(singleSwap.swapFee).amount()).toEqual(baseToAsset(correctOutput.swapFee).amount())
    expect(singleSwap.slip.toFixed(8)).toEqual(correctOutput.slip.toFixed(8))
  })

  it('should calculate correct double swap', async () => {
    const doubleSwapOutput = getDoubleSwapOutput(inputAmount, btcPool, ethPool)
    const expectedDoubleSwapOutput = new BigNumber(35.75077791)
    expect(baseToAsset(doubleSwapOutput).amount().toFixed(8)).toEqual(expectedDoubleSwapOutput.toFixed(8))
  })

  it('Should calculate correct double swap slip', async () => {
    const doubleSwapOutputSlip = getDoubleSwapSlip(inputAmount, btcPool, ethPool)
    const correctDoubleSwapOutputSlip = new BigNumber(0.0138452)
    expect(doubleSwapOutputSlip.toFixed(8)).toEqual(correctDoubleSwapOutputSlip.toFixed(8))
  })

  it('Should calculate correct double swap fee', async () => {
    const doubleSwapOutputFee = getDoubleSwapFee(inputAmount, btcPool, ethPool)
    const correctdoubleSwapOutputFee = new BigNumber(0.50191181)
    expect(baseToAsset(doubleSwapOutputFee).amount()).toEqual(correctdoubleSwapOutputFee)
  })

  it(`Should caculate double swap object`, async () => {
    const doubleswap = getDoubleSwap(inputAmount, btcPool, ethPool)

    const correctOutput: SwapOutput = {
      output: assetToBase(assetAmount(35.75077791)),
      swapFee: assetToBase(assetAmount(0.50191181)),
      slip: new BigNumber(0.0138452),
    }

    expect(baseToAsset(doubleswap.output).amount()).toEqual(baseToAsset(correctOutput.output).amount())
    expect(baseToAsset(doubleswap.swapFee).amount()).toEqual(baseToAsset(correctOutput.swapFee).amount())
    expect(doubleswap.slip.toFixed(8)).toEqual(correctOutput.slip.toFixed(8))
  })
})