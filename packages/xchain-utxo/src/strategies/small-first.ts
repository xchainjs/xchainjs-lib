import { UTXO } from '../types'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS, TxSizeConstants } from '../constants'
import { calculateTxFee } from '../fee'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'

/**
 * Small First strategy - good for consolidating many small UTXOs
 */
export class SmallFirstStrategy implements UtxoSelectionStrategy {
  name = 'SmallFirst'

  select(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number = 1,
    sizes: TxSizeConstants = TX_SIZE_CONSTANTS,
    dustThreshold: number = DUST_THRESHOLD,
  ): UtxoSelectionResult | null {
    const sortedUtxos = [...utxos].sort((a, b) => a.value - b.value)

    const selectedInputs: UTXO[] = []
    let currentValue = 0

    for (const utxo of sortedUtxos) {
      selectedInputs.push(utxo)
      currentValue += utxo.value

      const feeNoChange = calculateTxFee(selectedInputs.length, extraOutputs, feeRate, sizes)
      if (currentValue < targetValue + feeNoChange) continue

      // Change is kept only if it is still above dust once the change output is priced
      const feeWithChange = calculateTxFee(selectedInputs.length, extraOutputs + 1, feeRate, sizes)
      const change = currentValue - targetValue - feeWithChange

      if (change > dustThreshold) {
        return {
          inputs: [...selectedInputs],
          changeAmount: change,
          fee: feeWithChange,
          efficiency: targetValue / (currentValue + feeWithChange),
          strategy: this.name,
        }
      }

      // Dust change is not an output; it is added to the fee
      return {
        inputs: [...selectedInputs],
        changeAmount: 0,
        fee: currentValue - targetValue,
        efficiency: targetValue / (currentValue + feeNoChange),
        strategy: this.name,
      }
    }

    return null
  }
}
