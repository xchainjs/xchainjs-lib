import { UTXO } from '../types'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS, TxSizeConstants } from '../constants'
import { calculateTxFee } from '../fee'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'

/**
 * Accumulative strategy - simple and reliable fallback
 */
export class AccumulativeStrategy implements UtxoSelectionStrategy {
  name = 'Accumulative'

  select(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number = 1,
    sizes: TxSizeConstants = TX_SIZE_CONSTANTS,
    dustThreshold: number = DUST_THRESHOLD,
  ): UtxoSelectionResult | null {
    // Sort by value descending for faster accumulation
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

    const selectedInputs: UTXO[] = []
    let currentValue = 0

    for (const utxo of sortedUtxos) {
      selectedInputs.push(utxo)
      currentValue += utxo.value

      // Minimum fee is with no change output
      const feeNoChange = calculateTxFee(selectedInputs.length, extraOutputs, feeRate, sizes)
      const requiredNoChange = targetValue + feeNoChange

      if (currentValue >= requiredNoChange) {
        const potentialChange = currentValue - requiredNoChange

        if (potentialChange > dustThreshold) {
          // Adding a change output increases the fee
          const feeWithChange = calculateTxFee(selectedInputs.length, extraOutputs + 1, feeRate, sizes)
          const finalChange = currentValue - targetValue - feeWithChange

          // Fee grew, so change may have dropped to dust
          if (finalChange > dustThreshold) {
            return {
              inputs: [...selectedInputs],
              changeAmount: finalChange,
              fee: feeWithChange,
              efficiency: targetValue / currentValue,
              strategy: this.name,
            }
          }
        }

        // Dust change is not an output; it is added to the fee
        return {
          inputs: [...selectedInputs],
          changeAmount: 0,
          fee: feeNoChange + potentialChange,
          efficiency: targetValue / currentValue,
          strategy: this.name,
        }
      }
    }

    return null
  }
}
