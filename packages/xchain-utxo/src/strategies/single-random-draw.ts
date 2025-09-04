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
    // Shuffle UTXOs for randomness
    const shuffledUtxos = [...utxos].sort(() => Math.random() - 0.5)

    for (const utxo of shuffledUtxos) {
      const fee = this.calculateFee(1, extraOutputs, feeRate)
      const required = targetValue + fee

      if (utxo.value >= required) {
        const change = utxo.value - required
        const hasChange = change > SingleRandomDrawStrategy.DUST_THRESHOLD
        const finalFee = hasChange ? fee : fee + change

        return {
          inputs: [utxo],
          changeAmount: hasChange ? change : 0,
          fee: finalFee,
          efficiency: targetValue / (utxo.value + finalFee),
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
      SingleRandomDrawStrategy.BASE_TX_SIZE +
      inputCount * SingleRandomDrawStrategy.BYTES_PER_INPUT +
      outputCount * SingleRandomDrawStrategy.BYTES_PER_OUTPUT
    return Math.ceil(txSize * feeRate)
  }
}
