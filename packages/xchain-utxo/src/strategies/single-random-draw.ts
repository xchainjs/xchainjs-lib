import { UTXO } from '../types'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS, TxSizeConstants } from '../constants'
import { calculateTxFee } from '../fee'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'

/**
 * Single Random Draw strategy - good for privacy
 */
export class SingleRandomDrawStrategy implements UtxoSelectionStrategy {
  name = 'SingleRandomDraw'

  select(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number = 1,
    sizes: TxSizeConstants = TX_SIZE_CONSTANTS,
    dustThreshold: number = DUST_THRESHOLD,
  ): UtxoSelectionResult | null {
    // Fisher-Yates shuffle for unbiased randomness
    const shuffledUtxos = [...utxos]
    for (let i = shuffledUtxos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledUtxos[i], shuffledUtxos[j]] = [shuffledUtxos[j], shuffledUtxos[i]]
    }

    for (const utxo of shuffledUtxos) {
      // Fee with no change output
      const feeNoChange = calculateTxFee(1, extraOutputs, feeRate, sizes)
      const requiredNoChange = targetValue + feeNoChange

      if (utxo.value >= requiredNoChange) {
        const potentialChange = utxo.value - requiredNoChange

        if (potentialChange > dustThreshold) {
          // Adding a change output increases the fee
          const feeWithChange = calculateTxFee(1, extraOutputs + 1, feeRate, sizes)
          const requiredWithChange = targetValue + feeWithChange
          const actualChange = utxo.value - requiredWithChange

          // Fee grew, so change may have dropped to dust
          if (actualChange > dustThreshold) {
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
}
