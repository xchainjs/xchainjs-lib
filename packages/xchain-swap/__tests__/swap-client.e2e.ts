import { baseAmount } from "@xchainjs/xchain-util";
import { PoolData, getSwapOutput, getSwapSlip} from '../src/utils';

let btcPool: PoolData = {
  assetBalance: baseAmount(100),
  runeBalance: baseAmount(2500000)
}
describe('Swap client fee calculation tests', () => {
    it('should calculate correct slip fee', async () => {

      const inputAmount = baseAmount(1) // 1 BTC
      const swapOutputValue = getSwapOutput(inputAmount, btcPool, false )
      expect(swapOutputValue.eq(24507.4)) // output in RUNE

      const slip = getSwapSlip(inputAmount, btcPool, false)
      expect(slip.eq(0.00990099009900990099009900990099)) // 1/101 0.99 % slip.

    })
  })
