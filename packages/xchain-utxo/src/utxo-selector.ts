import { UTXO } from './types'
import { UtxoError } from './errors'
import { DUST_THRESHOLD, TX_SIZE_CONSTANTS } from './constants'
import {
  UtxoSelectionStrategy,
  UtxoSelectionResult,
  UtxoSelectionPreferences,
  BranchAndBoundStrategy,
  SingleRandomDrawStrategy,
  AccumulativeStrategy,
  LargestFirstStrategy,
  SmallFirstStrategy,
} from './strategies'

/**
 * Enhanced UTXO selector with multiple strategies
 */
export class UtxoSelector {
  private strategies: UtxoSelectionStrategy[]

  constructor() {
    this.strategies = [
      new BranchAndBoundStrategy(),
      new SingleRandomDrawStrategy(),
      new AccumulativeStrategy(),
      new LargestFirstStrategy(),
      new SmallFirstStrategy(),
    ]
  }

  // Constants for calculations - re-exported from shared constants
  public static readonly DUST_THRESHOLD = DUST_THRESHOLD
  public static readonly BYTES_PER_INPUT = TX_SIZE_CONSTANTS.BYTES_PER_INPUT
  public static readonly BYTES_PER_OUTPUT = TX_SIZE_CONSTANTS.BYTES_PER_OUTPUT
  public static readonly BASE_TX_SIZE = TX_SIZE_CONSTANTS.BASE_TX_SIZE

  /**
   * Select optimal UTXOs for a transaction
   */
  selectOptimal(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    preferences: UtxoSelectionPreferences = {},
    extraOutputs: number = 1, // recipient output + possible change output
  ): UtxoSelectionResult {
    if (utxos.length === 0) {
      throw UtxoError.utxoSelectionFailed(targetValue, 0, 'no UTXOs available')
    }

    // Validate inputs
    this.validateInputs(utxos, targetValue, feeRate)

    // Filter out dust UTXOs if requested
    const filteredUtxos = preferences.avoidDust
      ? utxos.filter((utxo) => utxo.value >= UtxoSelector.DUST_THRESHOLD)
      : utxos

    if (filteredUtxos.length === 0) {
      throw UtxoError.utxoSelectionFailed(targetValue, 0, 'no non-dust UTXOs available')
    }

    // Try each strategy and collect results
    const results: UtxoSelectionResult[] = []

    for (const strategy of this.strategies) {
      try {
        const result = strategy.select(filteredUtxos, targetValue, feeRate, extraOutputs)
        if (result && this.isValidResult(result, targetValue)) {
          results.push(result)
        }
      } catch {
        // Strategy failed, continue to next one
      }
    }

    if (results.length === 0) {
      const totalValue = filteredUtxos.reduce((sum, utxo) => sum + utxo.value, 0)
      throw UtxoError.utxoSelectionFailed(targetValue, totalValue)
    }

    // Select the best result based on preferences
    return this.selectBestResult(results, preferences)
  }

  /**
   * Select the best result based on preferences
   */
  private selectBestResult(results: UtxoSelectionResult[], preferences: UtxoSelectionPreferences): UtxoSelectionResult {
    return results.reduce((best, current) => {
      const bestScore = this.calculateScore(best, preferences)
      const currentScore = this.calculateScore(current, preferences)
      return currentScore > bestScore ? current : best
    })
  }

  /**
   * Calculate a score for a result based on preferences
   */
  private calculateScore(result: UtxoSelectionResult, preferences: UtxoSelectionPreferences): number {
    // Adjust base efficiency weight based on active preferences
    const hasSpecialPreference = preferences.minimizeInputs || preferences.minimizeChange
    let score = result.efficiency * (hasSpecialPreference ? 0.1 : 0.3)

    // Minimize fee preference
    if (preferences.minimizeFee) {
      const feeScore = Math.max(0, 1 - result.fee / 100000) // Normalize fee
      score += feeScore * 0.3
    }

    // Minimize inputs preference (privacy and transaction size)
    if (preferences.minimizeInputs) {
      if (result.inputs.length === 1) {
        score += 0.8 // Very high bonus for single input
      } else if (result.inputs.length === 2) {
        score += 0.3 // Moderate bonus for 2 inputs
      } else if (result.inputs.length === 3) {
        score += 0.1 // Small bonus for 3 inputs
      } else {
        // Heavily penalize many inputs when minimizeInputs is requested
        const inputPenalty = Math.min(0.7, (result.inputs.length - 1) * 0.2)
        score -= inputPenalty
      }
    }

    // Minimize change preference (exact or minimal change)
    if (preferences.minimizeChange) {
      if (result.changeAmount === 0) {
        score += 0.8 // Perfect - no change needed (very high bonus)
      } else if (result.changeAmount < UtxoSelector.DUST_THRESHOLD) {
        score += 0.6 // Small change that might be added to fee
      } else if (result.changeAmount < 1000) {
        score += 0.4 // Very small change (< 1000 sats)
      } else if (result.changeAmount < 5000) {
        score += 0.1 // Small change (< 5000 sats)
      } else {
        // Heavily penalize large change amounts when minimizeChange is requested
        // Use much stronger penalty for larger change amounts
        const changePenalty = Math.min(0.9, result.changeAmount / 20000) // Very strong penalty
        score -= changePenalty
      }
    }

    // Consolidate small UTXOs preference
    if (preferences.consolidateSmallUtxos) {
      const smallUtxoCount = result.inputs.filter(
        (utxo) => utxo.value < 10000, // Consider UTXOs under 0.0001 BTC as small
      ).length
      if (smallUtxoCount > 0) {
        score += smallUtxoCount * 0.2 // Large bonus for each small UTXO consolidated
      }
      // Additional bonus for using multiple small UTXOs instead of one large one
      if (smallUtxoCount >= 3) {
        score += 0.3 // Extra bonus for consolidating 3+ small UTXOs
      }
    }

    return Math.max(0, Math.min(1, score))
  }

  /**
   * Validate inputs for UTXO selection
   */
  private validateInputs(utxos: UTXO[], targetValue: number, feeRate: number): void {
    if (targetValue <= 0) {
      throw UtxoError.invalidAmount(targetValue, 'Target value must be positive')
    }

    if (feeRate <= 0) {
      throw UtxoError.invalidFeeRate(feeRate, 'Fee rate must be positive')
    }

    const totalValue = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
    if (totalValue < targetValue) {
      throw UtxoError.insufficientBalance(targetValue.toString(), totalValue.toString())
    }
  }

  /**
   * Validate that a result is correct
   */
  private isValidResult(result: UtxoSelectionResult, targetValue: number): boolean {
    const inputSum = result.inputs.reduce((sum, utxo) => sum + utxo.value, 0)
    const expectedTotal = targetValue + result.fee + result.changeAmount

    // Allow for small rounding differences
    return Math.abs(inputSum - expectedTotal) <= 1
  }

  /**
   * Calculate estimated transaction fee
   */
  static calculateFee(inputCount: number, outputCount: number, feeRate: number): number {
    const txSize =
      UtxoSelector.BASE_TX_SIZE +
      inputCount * UtxoSelector.BYTES_PER_INPUT +
      outputCount * UtxoSelector.BYTES_PER_OUTPUT
    return Math.ceil(txSize * feeRate)
  }
}
