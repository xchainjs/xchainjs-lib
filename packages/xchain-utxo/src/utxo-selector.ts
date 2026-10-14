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

  // Re-exported from shared constants
  public static readonly DUST_THRESHOLD = DUST_THRESHOLD
  public static readonly BYTES_PER_INPUT = TX_SIZE_CONSTANTS.BYTES_PER_INPUT
  public static readonly BYTES_PER_OUTPUT = TX_SIZE_CONSTANTS.BYTES_PER_OUTPUT
  public static readonly BASE_TX_SIZE = TX_SIZE_CONSTANTS.BASE_TX_SIZE

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

    this.validateInputs(utxos, targetValue, feeRate)

    const filteredUtxos = preferences.avoidDust
      ? utxos.filter((utxo) => utxo.value >= UtxoSelector.DUST_THRESHOLD)
      : utxos

    if (filteredUtxos.length === 0) {
      throw UtxoError.utxoSelectionFailed(targetValue, 0, 'no non-dust UTXOs available')
    }

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

    return this.selectBestResult(results, preferences)
  }

  private selectBestResult(results: UtxoSelectionResult[], preferences: UtxoSelectionPreferences): UtxoSelectionResult {
    return results.reduce((best, current) => {
      const bestScore = this.calculateScore(best, preferences)
      const currentScore = this.calculateScore(current, preferences)
      return currentScore > bestScore ? current : best
    })
  }

  private calculateScore(result: UtxoSelectionResult, preferences: UtxoSelectionPreferences): number {
    const hasSpecialPreference = preferences.minimizeInputs || preferences.minimizeChange
    let score = result.efficiency * (hasSpecialPreference ? 0.1 : 0.3)

    if (preferences.minimizeFee) {
      const feeScore = Math.max(0, 1 - result.fee / 100000) // Normalize fee
      score += feeScore * 0.3
    }

    // Fewer inputs is better for privacy and transaction size
    if (preferences.minimizeInputs) {
      if (result.inputs.length === 1) {
        score += 0.8
      } else if (result.inputs.length === 2) {
        score += 0.3
      } else if (result.inputs.length === 3) {
        score += 0.1
      } else {
        const inputPenalty = Math.min(0.7, (result.inputs.length - 1) * 0.2)
        score -= inputPenalty
      }
    }

    if (preferences.minimizeChange) {
      if (result.changeAmount === 0) {
        score += 0.8
      } else if (result.changeAmount < UtxoSelector.DUST_THRESHOLD) {
        score += 0.6 // Dust change can be absorbed into the fee
      } else if (result.changeAmount < 1000) {
        score += 0.4
      } else if (result.changeAmount < 5000) {
        score += 0.1
      } else {
        const changePenalty = Math.min(0.9, result.changeAmount / 20000)
        score -= changePenalty
      }
    }

    if (preferences.consolidateSmallUtxos) {
      const smallUtxoCount = result.inputs.filter(
        (utxo) => utxo.value < 10000, // under 0.0001 BTC
      ).length
      if (smallUtxoCount > 0) {
        score += smallUtxoCount * 0.2
      }
      if (smallUtxoCount >= 3) {
        score += 0.3
      }
    }

    return Math.max(0, Math.min(1, score))
  }

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

  private isValidResult(result: UtxoSelectionResult, targetValue: number): boolean {
    const inputSum = result.inputs.reduce((sum, utxo) => sum + utxo.value, 0)
    const expectedTotal = targetValue + result.fee + result.changeAmount

    // Allow for small rounding differences
    return Math.abs(inputSum - expectedTotal) <= 1
  }

  static calculateFee(inputCount: number, outputCount: number, feeRate: number): number {
    const txSize =
      UtxoSelector.BASE_TX_SIZE +
      inputCount * UtxoSelector.BYTES_PER_INPUT +
      outputCount * UtxoSelector.BYTES_PER_OUTPUT
    return Math.ceil(txSize * feeRate)
  }
}
