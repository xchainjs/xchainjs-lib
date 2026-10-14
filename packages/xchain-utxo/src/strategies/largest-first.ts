import { UTXO } from '../types'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'
import { AccumulativeStrategy } from './accumulative'

/**
 * Largest First strategy - good for consolidation
 */
export class LargestFirstStrategy implements UtxoSelectionStrategy {
  name = 'LargestFirst'

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)
    return new AccumulativeStrategy().select(sortedUtxos, targetValue, feeRate, extraOutputs)
  }
}
