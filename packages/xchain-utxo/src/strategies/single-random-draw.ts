import { UTXO } from '../types'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS } from '../constants'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'

/**
 * Single Random Draw strategy - good for privacy
 */
export class SingleRandomDrawStrategy implements UtxoSelectionStrategy {
  name = 'SingleRandomDraw'

  private static readonly DUST_THRESHOLD = DUST_THRESHOLD
  private static readonly BYTES_PER_INPUT = TX_SIZE_CONSTANTS.BYTES_PER_INPUT
  private static readonly BYTES_PER_OUTPUT = TX_SIZE_CONSTANTS.BYTES_PER_OUTPUT
  private static readonly BASE_TX_SIZE = TX_SIZE_CONSTANTS.BASE_TX_SIZE

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Fisher-Yates shuffle for unbiased randomness
    const shuffledUtxos = [...utxos]
    for (let i = shuffledUtxos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledUtxos[i], shuffledUtxos[j]] = [shuffledUtxos[j], shuffledUtxos[i]]
    }

    for (const utxo of shuffledUtxos) {
      // Fee with no change output
      const feeNoChange = this.calculateFee(1, extraOutputs, feeRate)
      const requiredNoChange = targetValue + feeNoChange

      if (utxo.value >= requiredNoChange) {
        const potentialChange = utxo.value - requiredNoChange

        if (potentialChange > SingleRandomDrawStrategy.DUST_THRESHOLD) {
          // Adding a change output increases the fee
          const feeWithChange = this.calculateFee(1, extraOutputs + 1, feeRate)
          const requiredWithChange = targetValue + feeWithChange
          const actualChange = utxo.value - requiredWithChange

          // Fee grew, so change may have dropped to dust
          if (actualChange > SingleRandomDrawStrategy.DUST_THRESHOLD) {
            return {
              inputs: [utxo],
              changeAmount: actualChange,
              fee: feeWithChange,
              efficiency: targetValue / utxo.value,
              strategy: this.name,
            }
          }
        }

        // Dust change is added to the fee
        return {
          inputs: [utxo],
          changeAmount: 0,
          fee: feeNoChange + potentialChange,
          efficiency: targetValue / utxo.value,
          strategy: this.name,
        }
      }
    }

    return null
  }

  private calculateFee(inputCount: number, outputCount: number, feeRate: number): number {
    const txSize =
      SingleRandomDrawStrategy.BASE_TX_SIZE +
      inputCount * SingleRandomDrawStrategy.BYTES_PER_INPUT +
      outputCount * SingleRandomDrawStrategy.BYTES_PER_OUTPUT
    return Math.ceil(txSize * feeRate)
  }
}
