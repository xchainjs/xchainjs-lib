import { assetToBase, baseToAsset, assetAmount} from '@xchainjs/xchain-util'
import { getSwapFee, getSwapOutput, getSwapSlip, getDoubleSwapOutput, getDoubleSwapSlip } from '../src/utils/swap'
import { PoolData } from '../src/types'
import { BigNumber } from 'bignumber.js'


const btcPool: PoolData = {
  assetBalance: assetToBase(assetAmount(100)),
  runeBalance: assetToBase(assetAmount(2500000))
}

const ethPool: PoolData = {
assetBalance: assetToBase(assetAmount(9100)),
runeBalance: assetToBase(assetAmount(6189000))
}
const inputAmount =  assetToBase(assetAmount(1)) // 1 BTC


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

  it('should calculate correct double swap', async () => {
    const doubleSwapOutput = getDoubleSwapOutput(inputAmount, btcPool, ethPool)
    const expectedDoubleSwapOutput = new BigNumber(35.75077791)
    expect(baseToAsset(doubleSwapOutput).amount().toFixed(8)).toEqual(expectedDoubleSwapOutput.toFixed(8))
  })

  it('Should calculate correct double swap slip', async () =>{
    const doubleSwapOutputSlip = getDoubleSwapSlip(inputAmount, btcPool, ethPool)
    const correctDoubleSwapOutputSlip = new BigNumber(0.01384520)
    expect(doubleSwapOutputSlip.toFixed(8)).toEqual(correctDoubleSwapOutputSlip.toFixed(8))
  })
})
