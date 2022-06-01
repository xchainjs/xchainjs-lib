import { assetAmount, assetToBase, baseToAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { PoolData, SwapOutput } from '../src/types'
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

const btcPool: PoolData = {
  assetBalance: assetToBase(assetAmount(100)),
  runeBalance: assetToBase(assetAmount(2500000)),
}

const ethPool: PoolData = {
  assetBalance: assetToBase(assetAmount(9100)),
  runeBalance: assetToBase(assetAmount(6189000)),
}
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
