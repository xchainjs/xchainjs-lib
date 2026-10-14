import { UTXO } from '../types'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS } from '../constants'
import { UtxoSelectionStrategy, UtxoSelectionResult } from './types'

/**
 * Branch and Bound strategy - optimal for minimizing fees and change
 */
export class BranchAndBoundStrategy implements UtxoSelectionStrategy {
  name = 'BranchAndBound'

  private static readonly MAX_TRIES = 100000
  private static readonly DUST_THRESHOLD = DUST_THRESHOLD
  private static readonly BYTES_PER_INPUT = TX_SIZE_CONSTANTS.BYTES_PER_INPUT
  private static readonly BYTES_PER_OUTPUT = TX_SIZE_CONSTANTS.BYTES_PER_OUTPUT
  private static readonly BASE_TX_SIZE = TX_SIZE_CONSTANTS.BASE_TX_SIZE

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Descending value improves branch-and-bound pruning
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

    // Pass targetValue, not target+fee, so the fee is not counted twice
    const exactResult = this.findExactMatch(sortedUtxos, targetValue, feeRate, extraOutputs)
    if (exactResult) return exactResult

    return this.branchAndBound(sortedUtxos, targetValue, feeRate, extraOutputs)
  }

  private findExactMatch(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number,
  ): UtxoSelectionResult | null {
    // Single input, no change output
    const singleInputFee = this.calculateFee(1, extraOutputs, feeRate)
    const requiredWithFee = targetValue + singleInputFee

    const sortedByExactness = [...utxos].sort((a, b) => {
      const aDiff = Math.abs(a.value - requiredWithFee)
      const bDiff = Math.abs(b.value - requiredWithFee)
      return aDiff - bDiff
    })

    for (const utxo of sortedByExactness) {
      const change = utxo.value - requiredWithFee

      // Change at or below dust is absorbed into the fee
      if (change >= 0 && change <= BranchAndBoundStrategy.DUST_THRESHOLD) {
        return {
          inputs: [utxo],
          changeAmount: 0,
          fee: singleInputFee + change, // Absorb dust into fee
          efficiency: 1.0,
          strategy: this.name,
        }
      }

      // Skip a change output that is more than 10% of the target
      if (change > BranchAndBoundStrategy.DUST_THRESHOLD && change < targetValue * 0.1) {
        const feeWithChange = this.calculateFee(1, extraOutputs + 1, feeRate)
        const finalChange = utxo.value - targetValue - feeWithChange

        if (finalChange > BranchAndBoundStrategy.DUST_THRESHOLD) {
          return {
            inputs: [utxo],
            changeAmount: finalChange,
            fee: feeWithChange,
            efficiency: 0.95,
            strategy: this.name,
          }
        }
      }
    }

    return null
  }

  private branchAndBound(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number,
  ): UtxoSelectionResult | null {
    const target = targetValue
    let bestResult: UtxoSelectionResult | null = null
    let tries = 0

    const search = (index: number, currentInputs: UTXO[], currentValue: number, depth: number): void => {
      if (tries++ >= BranchAndBoundStrategy.MAX_TRIES) return

      const inputCount = currentInputs.length
      const outputCount =
        extraOutputs +
        (currentValue >
        target + this.calculateFee(inputCount, extraOutputs, feeRate) + BranchAndBoundStrategy.DUST_THRESHOLD
          ? 1
          : 0)
      const fee = this.calculateFee(inputCount, outputCount, feeRate)
      const required = target + fee

      if (currentValue >= required) {
        const change = currentValue - required
        const finalFee = change > BranchAndBoundStrategy.DUST_THRESHOLD ? fee : fee + change

        const result: UtxoSelectionResult = {
          inputs: [...currentInputs],
          changeAmount: change > BranchAndBoundStrategy.DUST_THRESHOLD ? change : 0,
          fee: finalFee,
          efficiency: this.calculateEfficiency(
            currentInputs,
            target,
            finalFee,
            change,
            change <= BranchAndBoundStrategy.DUST_THRESHOLD,
          ),
          strategy: this.name,
        }

        if (!bestResult || result.fee < bestResult.fee) {
          bestResult = result
        }
        return
      }

      if (index >= utxos.length) return
      if (depth > 50) return // Cap depth so wallets with many UTXOs stay tractable

      const remainingValue = utxos.slice(index).reduce((sum, utxo) => sum + utxo.value, 0)
      if (currentValue + remainingValue < required) return

      // Include current UTXO
      search(index + 1, [...currentInputs, utxos[index]], currentValue + utxos[index].value, depth + 1)

      // Exclude current UTXO until a good solution exists
      if (!bestResult || currentInputs.length < 3) {
        search(index + 1, currentInputs, currentValue, depth + 1)
      }
    }

    search(0, [], 0, 0)
    return bestResult
  }

  private calculateEfficiency(
    inputs: UTXO[],
    target: number,
    fee: number,
    change: number,
    changeAbsorbed: boolean = false,
  ): number {
    const totalValue = inputs.reduce((sum, utxo) => sum + utxo.value, 0)
    const wastedValue = changeAbsorbed ? 0 : change > BranchAndBoundStrategy.DUST_THRESHOLD ? 0 : change
    const efficiency = target / (totalValue + fee + wastedValue)
    return Math.min(1, efficiency)
  }

  private calculateFee(inputCount: number, outputCount: number, feeRate: number): number {
    const txSize =
      BranchAndBoundStrategy.BASE_TX_SIZE +
      inputCount * BranchAndBoundStrategy.BYTES_PER_INPUT +
      outputCount * BranchAndBoundStrategy.BYTES_PER_OUTPUT
    return Math.ceil(txSize * feeRate)
  }
}
