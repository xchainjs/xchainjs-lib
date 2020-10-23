import bn, { formatBN } from '../bn'
import { assetAmount, assetToBase, baseToAsset } from '../asset'
import {
  PoolData,
  getSwapOutput,
  getSwapOutputWithFee,
  getSwapInput,
  getSwapSlip,
  getSwapFee,
  getValueOfAssetInRune,
  getValueOfRuneInAsset,
  getDoubleSwapOutput,
  getDoubleSwapOutputWithFee,
  getDoubleSwapInput,
  getDoubleSwapSlip,
  getDoubleSwapFee,
  getValueOfAsset1InAsset2,
} from './swap'

const assetPool: PoolData = { assetBalance: assetToBase(assetAmount(110)), runeBalance: assetToBase(assetAmount(100)) }
const usdPool: PoolData = { assetBalance: assetToBase(assetAmount(10)), runeBalance: assetToBase(assetAmount(100)) }
const assetInput = assetToBase(assetAmount(1))
const runeInput = assetToBase(assetAmount(1))
const assetOutput = assetToBase(assetAmount(0.89278468))
const usdOutput = assetToBase(assetAmount(0.08770544))

describe('swap calc', () => {
  describe('Single Swaps', () => {
    it('Gets correct output', () => {
      const output = getSwapOutput(assetInput, assetPool, true)
      expect(output.amount()).toEqual(assetOutput.amount())
    })
    it('Gets correct output with fee', () => {
      const output = getSwapOutputWithFee(assetInput, assetPool, false)
      expect(output.amount().toNumber()).toBeLessThanOrEqual(0)
    })
    it('Gets correct input', () => {
      const input = getSwapInput(true, assetPool, assetOutput)
      expect(input.amount()).toEqual(assetInput.amount())
    })
    it('Gets correct slip', () => {
      const output = getSwapSlip(assetInput, assetPool, true)
      const expected = bn('0.00900901')
      expect(formatBN(output, 8)).toEqual(formatBN(expected, 8))
    })
    it('Gets correct fee', () => {
      const output = getSwapFee(assetInput, assetPool, true)
      const expected = assetAmount('0.00811622').amount()
      expect(formatBN(baseToAsset(output).amount(), 8)).toEqual(formatBN(expected, 8))
    })
    it('Gets correct Value of Asset in Rune', () => {
      const output = getValueOfAssetInRune(assetInput, assetPool)
      const expected = assetAmount('0.90909091').amount()
      expect(formatBN(baseToAsset(output).amount(), 8)).toEqual(formatBN(expected, 8))
    })
    it('Gets correct Value of Rune in Asset', () => {
      const output = getValueOfRuneInAsset(runeInput, assetPool)
      const expected = assetAmount('1.1').amount()
      expect(formatBN(baseToAsset(output).amount(), 8)).toEqual(formatBN(expected, 8))
    })
  })

  describe('Double Swaps', () => {
    it('Gets correct output', () => {
      const output = getDoubleSwapOutput(assetInput, assetPool, usdPool)
      const expected = assetAmount('0.08770544').amount()
      expect(baseToAsset(output).amount()).toEqual(expected)
    })

    it('Gets correct output', () => {
      const output = getDoubleSwapInput(assetPool, usdPool, usdOutput)
      const expected = assetToBase(assetAmount('1.00000005'))
      expect(output.amount().toString()).toEqual(expected.amount().toString())
    })

    it('Gets correct output with fee', () => {
      const output = getDoubleSwapOutputWithFee(assetInput, assetPool, usdPool)
      const expected = assetToBase(assetAmount('-0.01054038'))
      expect(output.amount().toString()).toEqual(expected.amount().toString())
    })

    it('Gets correct slip', () => {
      const slip1 = getSwapSlip(assetInput, assetPool, true)
      const expected1 = bn('0.00900901')
      expect(formatBN(slip1)).toEqual(formatBN(expected1))
      const r = getSwapOutput(assetInput, assetPool, true)
      const slip2 = getSwapSlip(r, usdPool, false)
      const expected2 = bn('0.00884885')
      expect(formatBN(slip2)).toEqual(formatBN(expected2))
      const output = getDoubleSwapSlip(assetInput, assetPool, usdPool)
      const expected3 = bn('0.01785785')
      expect(formatBN(output)).toEqual(formatBN(expected3))
    })

    it('Gets correct fee', () => {
      const fee1 = getSwapFee(assetInput, assetPool, true)
      const expected1 = assetAmount('0.00811622').amount()
      expect(formatBN(baseToAsset(fee1).amount())).toEqual(formatBN(expected1))
      const r = getSwapOutput(assetInput, assetPool, true)
      const fee2 = getSwapFee(r, usdPool, false)
      const expected2 = assetAmount('0.00078302').amount()
      expect(formatBN(baseToAsset(fee2).amount(), 8)).toEqual(formatBN(expected2, 8))
      const output = getDoubleSwapFee(assetInput, assetPool, usdPool)
      const expected = assetAmount('0.00159464').amount()
      expect(formatBN(baseToAsset(output).amount())).toEqual(formatBN(expected))
    })

    it('Gets correct Value of Asset1 in USD', () => {
      const output = getValueOfAsset1InAsset2(assetInput, assetPool, usdPool)
      const expected = assetToBase(assetAmount('0.09090909'))
      expect(output.amount().toString()).toEqual(expected.amount().toString())
    })
  })
})
