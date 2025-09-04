import { UTXO } from '../types'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS } from '../constants'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'

/**
 * Small First strategy - good for consolidating many small UTXOs
 */
export class SmallFirstStrategy implements UtxoSelectionStrategy {
  name = 'SmallFirst'

  private static readonly DUST_THRESHOLD = DUST_THRESHOLD
  private static readonly BYTES_PER_INPUT = TX_SIZE_CONSTANTS.BYTES_PER_INPUT
  private static readonly BYTES_PER_OUTPUT = TX_SIZE_CONSTANTS.BYTES_PER_OUTPUT
  private static readonly BASE_TX_SIZE = TX_SIZE_CONSTANTS.BASE_TX_SIZE

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Sort by value ascending to prioritize small UTXOs
    const sortedUtxos = [...utxos].sort((a, b) => a.value - b.value)

    const selectedInputs: UTXO[] = []
    let currentValue = 0

    for (const utxo of sortedUtxos) {
      selectedInputs.push(utxo)
      currentValue += utxo.value

      const fee = this.calculateFee(selectedInputs.length, extraOutputs + 1, feeRate) // Assume change output
      const required = targetValue + fee

      if (currentValue >= required) {
        const change = currentValue - required
        const hasChange = change > SmallFirstStrategy.DUST_THRESHOLD
        const finalOutputs = hasChange ? extraOutputs + 1 : extraOutputs
        const finalFee = this.calculateFee(selectedInputs.length, finalOutputs, feeRate)
        const finalChange = currentValue - targetValue - finalFee

        return {
          inputs: [...selectedInputs],
          changeAmount: finalChange > SmallFirstStrategy.DUST_THRESHOLD ? finalChange : 0,
          fee: finalChange > SmallFirstStrategy.DUST_THRESHOLD ? finalFee : finalFee + finalChange,
          efficiency: targetValue / (currentValue + finalFee),
          strategy: this.name,
        }
      }
    }

    return null
  }

  /**
   * Calculate estimated transaction fee
   */
  private calculateFee(inputCount: number, outputCount: number, feeRate: number): number {
    const txSize =
      SmallFirstStrategy.BASE_TX_SIZE +
      inputCount * SmallFirstStrategy.BYTES_PER_INPUT +
      outputCount * SmallFirstStrategy.BYTES_PER_OUTPUT
    return Math.ceil(txSize * feeRate)
  }
}
