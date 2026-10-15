import { DUST_THRESHOLD, TX_SIZE_CONSTANTS, TxSizeConstants } from '../constants'
import { UTXO } from '../types'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'
import { AccumulativeStrategy } from './accumulative'

/**
 * Largest First strategy - good for consolidation
 */
export class LargestFirstStrategy implements UtxoSelectionStrategy {
  name = 'LargestFirst'

  select(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number = 1,
    sizes: TxSizeConstants = TX_SIZE_CONSTANTS,
    dustThreshold: number = DUST_THRESHOLD,
  ): UtxoSelectionResult | null {
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)
    return new AccumulativeStrategy().select(sortedUtxos, targetValue, feeRate, extraOutputs, sizes, dustThreshold)
  }
}
