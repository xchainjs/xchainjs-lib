import { UTXO } from '../types'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS } from '../constants'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'

/**
 * Accumulative strategy - simple and reliable fallback
 */
export class AccumulativeStrategy implements UtxoSelectionStrategy {
  name = 'Accumulative'

  private static readonly DUST_THRESHOLD = DUST_THRESHOLD
  private static readonly BYTES_PER_INPUT = TX_SIZE_CONSTANTS.BYTES_PER_INPUT
  private static readonly BYTES_PER_OUTPUT = TX_SIZE_CONSTANTS.BYTES_PER_OUTPUT
  private static readonly BASE_TX_SIZE = TX_SIZE_CONSTANTS.BASE_TX_SIZE

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Sort by value descending for faster accumulation
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

    const selectedInputs: UTXO[] = []
    let currentValue = 0

    for (const utxo of sortedUtxos) {
      selectedInputs.push(utxo)
      currentValue += utxo.value

      // Minimum fee is with no change output
      const feeNoChange = this.calculateFee(selectedInputs.length, extraOutputs, feeRate)
      const requiredNoChange = targetValue + feeNoChange

      if (currentValue >= requiredNoChange) {
        const potentialChange = currentValue - requiredNoChange

        if (potentialChange > AccumulativeStrategy.DUST_THRESHOLD) {
          // Adding a change output increases the fee
          const feeWithChange = this.calculateFee(selectedInputs.length, extraOutputs + 1, feeRate)
          const finalChange = currentValue - targetValue - feeWithChange

          // Fee grew, so change may have dropped to dust
          if (finalChange > AccumulativeStrategy.DUST_THRESHOLD) {
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

  private calculateFee(inputCount: number, outputCount: number, feeRate: number): number {
    const txSize =
      AccumulativeStrategy.BASE_TX_SIZE +
      inputCount * AccumulativeStrategy.BYTES_PER_INPUT +
      outputCount * AccumulativeStrategy.BYTES_PER_OUTPUT
    return Math.ceil(txSize * feeRate)
  }
}
