import { TX_SIZE_CONSTANTS, TxSizeConstants } from '../src/constants'
import {
  AccumulativeStrategy,
  BranchAndBoundStrategy,
  LargestFirstStrategy,
  SingleRandomDrawStrategy,
  SmallFirstStrategy,
  UtxoSelectionStrategy,
} from '../src/strategies'
import { UTXO } from '../src/types'
import { outputBytes } from '../src/fee'
import { UtxoSelector } from '../src/utxo-selector'

const utxo = (value: number, n = 0): UTXO => ({ hash: `hash${n}`, index: 0, value })

// Legacy P2PKH sizes, with a 70-byte memo script (a 79-byte output) and a P2PKH recipient folded into the base
const P2PKH: TxSizeConstants = { BASE_TX_SIZE: 10, BYTES_PER_INPUT: 148, BYTES_PER_OUTPUT: 34 }
const FOLDED: TxSizeConstants = { ...P2PKH, BASE_TX_SIZE: P2PKH.BASE_TX_SIZE + 34 + (9 + 70) }

describe('UTXO fee model', () => {
  describe('calculateFee', () => {
    it('keeps the 3-arg form on the default sizes', () => {
      expect(TX_SIZE_CONSTANTS).toEqual({ BASE_TX_SIZE: 10, BYTES_PER_INPUT: 68, BYTES_PER_OUTPUT: 31 })
      expect(UtxoSelector.calculateFee(1, 2, 3)).toBe((10 + 68 + 62) * 3)
    })

    it('uses the injected sizes', () => {
      expect(UtxoSelector.calculateFee(2, 1, 5, P2PKH)).toBe((10 + 2 * 148 + 34) * 5)
    })

    it('rounds the rate up before multiplying', () => {
      expect(UtxoSelector.calculateFee(1, 1, 1.2)).toBe((10 + 68 + 31) * 2)
    })
  })

  describe('strategies', () => {
    const strategies: UtxoSelectionStrategy[] = [
      new BranchAndBoundStrategy(),
      new SingleRandomDrawStrategy(),
      new AccumulativeStrategy(),
      new LargestFirstStrategy(),
      new SmallFirstStrategy(),
    ]

    it.each(strategies.map((s) => [s.name, s] as const))('%s prices the injected sizes', (_name, strategy) => {
      const utxos = [utxo(1_000_000)]
      const result = strategy.select(utxos, 500_000, 3, 0, FOLDED)
      expect(result).not.toBeNull()
      // Recipient and memo are in the base, so the change output is the only extra output
      expect(result?.fee).toBe(UtxoSelector.calculateFee(1, 1, 3, FOLDED))
      expect(result?.changeAmount).toBe(1_000_000 - 500_000 - (result?.fee ?? 0))
    })

    it.each(strategies.map((s) => [s.name, s] as const))(
      '%s absorbs change below the injected dust',
      (_name, strategy) => {
        const feeNoChange = UtxoSelector.calculateFee(1, 1, 3)
        const utxos = [utxo(500_000 + feeNoChange + 2_000)]
        // 2000 left over is 1907 of change once the change output (93) is priced: kept at the default dust, absorbed with a 5460 dust
        expect(strategy.select(utxos, 500_000, 3, 1)?.changeAmount).toBe(1907)
        const result = strategy.select(utxos, 500_000, 3, 1, TX_SIZE_CONSTANTS, 5460)
        expect(result?.changeAmount).toBe(0)
        expect(result?.fee).toBe(feeNoChange + 2_000)
      },
    )

    it('SmallFirst prices the change output when change is kept', () => {
      // Rate 10: 51800 leaves 710 of change after pricing one output, but 400 once the change output is priced
      const result = new SmallFirstStrategy().select([utxo(51_800)], 50_000, 10, 1)
      expect(result).toEqual(expect.objectContaining({ changeAmount: 0, fee: 1_800 }))

      const withChange = new SmallFirstStrategy().select([utxo(52_500)], 50_000, 10, 1)
      expect(withChange).toEqual(expect.objectContaining({ changeAmount: 1_100, fee: 1_400 }))
    })
  })

  describe('selector', () => {
    it('passes sizes to every strategy', () => {
      const utxos = [utxo(3_000_000, 1), utxo(3_000_000, 2)]
      const result = new UtxoSelector().selectOptimal(utxos, 1_000_000, 5, {}, 0, FOLDED)
      expect(result.fee).toBe(UtxoSelector.calculateFee(result.inputs.length, 1, 5, FOLDED))
      expect(result.inputs.reduce((sum, u) => sum + u.value, 0)).toBe(1_000_000 + result.fee + result.changeAmount)
    })

    it('forwards the dust to the strategies', () => {
      const utxos = [utxo(1_500_000)]
      // About 500,000 of change: kept at the default dust, absorbed into the fee at a 1,000,000 dust
      expect(new UtxoSelector().selectOptimal(utxos, 1_000_000, 5, {}, 1).changeAmount).toBeGreaterThan(0)
      const result = new UtxoSelector().selectOptimal(utxos, 1_000_000, 5, {}, 1, TX_SIZE_CONSTANTS, 1_000_000)
      expect(result.changeAmount).toBe(0)
      expect(result.fee).toBe(500_000)
    })
  })

  describe('outputBytes', () => {
    it('sizes the script length varint', () => {
      expect(outputBytes(0)).toBe(9)
      expect(outputBytes(252)).toBe(261)
      expect(outputBytes(253)).toBe(264)
      expect(outputBytes(0xffff)).toBe(8 + 3 + 0xffff)
      expect(outputBytes(0x10000)).toBe(8 + 5 + 0x10000)
    })
  })
})
