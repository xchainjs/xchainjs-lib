import { baseAmount } from '@xchainjs/xchain-util'
import { PoolData, getSwapOutput, getSwapSlip, getSwapFee } from '../src/utils/swap'

const btcPool: PoolData = {
  assetBalance: baseAmount(100),
  runeBalance: baseAmount(2500000),
}
const inputAmount = baseAmount(1) // 1 BTC



describe('Swap Cal Tests', () => {
  it('should calculate correct swap output', async () => {
    const swapOutputValue = getSwapOutput(inputAmount, btcPool, true)
    var correctOutput = baseAmount(24507.4, 8)
    expect(swapOutputValue.amount().toNumber()).toEqual(correctOutput.amount().toNumber())// output in RUNE
  })
  it('should calculate correct slip percentage', async () => {
    const slip = getSwapSlip(inputAmount, btcPool, true)
    const correctSlip = 0.00990099009900990099009900990099 // 1/101 0.99 % slip.
    expect(slip.toNumber()).toEqual(correctSlip)
  })

  it('should calculate correct swap fee', async () => {
    const slipFee = getSwapFee(inputAmount, btcPool, true)
    const expectedSlipFee = 242.64752475247524752475247524752
    expect(slipFee.amount().toNumber()).toEqual(expectedSlipFee)
  })

})
