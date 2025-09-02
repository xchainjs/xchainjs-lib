import { UTXO } from './types'
import { UtxoError } from './errors'

/**
 * Interface for UTXO selection strategies
 */
export interface UtxoSelectionStrategy {
  name: string
  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs?: number): UtxoSelectionResult | null
}

/**
 * Result of UTXO selection
 */
export interface UtxoSelectionResult {
  inputs: UTXO[]
  changeAmount: number
  fee: number
  efficiency: number // 0-1 score indicating how good this selection is
  strategy: string
}

/**
 * UTXO selection preferences
 */
export interface UtxoSelectionPreferences {
  minimizeFee?: boolean
  minimizeInputs?: boolean
  minimizeChange?: boolean
  avoidDust?: boolean
  consolidateSmallUtxos?: boolean
}

/**
 * Enhanced UTXO selector with multiple strategies
 */
export class UtxoSelector {
  private strategies: UtxoSelectionStrategy[]

  constructor() {
    this.strategies = [
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new BranchAndBoundStrategy(),
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new SingleRandomDrawStrategy(),
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new AccumulativeStrategy(),
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new LargestFirstStrategy(),
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new SmallFirstStrategy(),
    ]
  }

  // Constants for calculations
  public static readonly DUST_THRESHOLD = 546 // satoshis
  public static readonly BYTES_PER_INPUT = 68 // approximate vbytes per P2WPKH input
  public static readonly BYTES_PER_OUTPUT = 31 // vbytes per P2WPKH output
  public static readonly BASE_TX_SIZE = 10 // base transaction overhead

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
      ? utxos.filter((utxo) => utxo.value > UtxoSelector.DUST_THRESHOLD)
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
      } catch (error) {
        console.debug(`Strategy ${strategy.name} failed:`, error)
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

/**
 * Branch and Bound strategy - optimal for minimizing fees and change
 */
export class BranchAndBoundStrategy implements UtxoSelectionStrategy {
  name = 'BranchAndBound'

  private static readonly MAX_TRIES = 100000

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Sort UTXOs by descending value for better branch and bound performance
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

    // Calculate the target including fee with no change output
    const noChangeFee = UtxoSelector.calculateFee(1, extraOutputs, feeRate)
    const exactTarget = targetValue + noChangeFee

    // Try to find exact match first
    const exactResult = this.findExactMatch(sortedUtxos, exactTarget, feeRate, extraOutputs)
    if (exactResult) return exactResult

    // Run branch and bound algorithm
    return this.branchAndBound(sortedUtxos, targetValue, feeRate, extraOutputs)
  }

  private findExactMatch(
    utxos: UTXO[],
    target: number,
    feeRate: number,
    extraOutputs: number,
  ): UtxoSelectionResult | null {
    // Calculate fee for single input
    const singleInputFee = UtxoSelector.calculateFee(1, extraOutputs, feeRate)
    const requiredWithFee = target + singleInputFee

    // Sort by how close they are to the exact target
    const sortedByExactness = [...utxos].sort((a, b) => {
      const aDiff = Math.abs(a.value - requiredWithFee)
      const bDiff = Math.abs(b.value - requiredWithFee)
      return aDiff - bDiff
    })

    // Look for single UTXO that matches exactly or closely
    for (const utxo of sortedByExactness) {
      const change = utxo.value - requiredWithFee

      // If change is exactly 0 or less than dust (which we absorb into fee)
      if (change >= 0 && change <= UtxoSelector.DUST_THRESHOLD) {
        return {
          inputs: [utxo],
          changeAmount: 0,
          fee: singleInputFee + change, // Absorb dust into fee
          efficiency: 1.0, // Perfect efficiency for exact match
          strategy: this.name,
        }
      }

      // If we have reasonable change (not too much excess)
      if (change > UtxoSelector.DUST_THRESHOLD && change < target * 0.1) {
        // Add change output fee
        const feeWithChange = UtxoSelector.calculateFee(1, extraOutputs + 1, feeRate)
        const finalChange = utxo.value - target - feeWithChange

        if (finalChange > UtxoSelector.DUST_THRESHOLD) {
          return {
            inputs: [utxo],
            changeAmount: finalChange,
            fee: feeWithChange,
            efficiency: 0.95, // Very good efficiency
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

      // Calculate current fee and requirements
      const inputCount = currentInputs.length
      const outputCount =
        extraOutputs +
        (currentValue >
        target + UtxoSelector.calculateFee(inputCount, extraOutputs, feeRate) + UtxoSelector.DUST_THRESHOLD
          ? 1
          : 0)
      const fee = UtxoSelector.calculateFee(inputCount, outputCount, feeRate)
      const required = target + fee

      // Check if we have a solution
      if (currentValue >= required) {
        const change = currentValue - required
        const finalFee = change > UtxoSelector.DUST_THRESHOLD ? fee : fee + change

        const result: UtxoSelectionResult = {
          inputs: [...currentInputs],
          changeAmount: change > UtxoSelector.DUST_THRESHOLD ? change : 0,
          fee: finalFee,
          efficiency: this.calculateEfficiency(
            currentInputs,
            target,
            finalFee,
            change,
            change <= UtxoSelector.DUST_THRESHOLD,
          ),
          strategy: this.name,
        }

        if (!bestResult || result.fee < bestResult.fee) {
          bestResult = result
        }
        return
      }

      // Pruning conditions
      if (index >= utxos.length) return
      if (depth > 20) return // Prevent too deep recursion

      const remainingValue = utxos.slice(index).reduce((sum, utxo) => sum + utxo.value, 0)
      if (currentValue + remainingValue < required) return // Not enough remaining value

      // Branch 1: Include current UTXO
      search(index + 1, [...currentInputs, utxos[index]], currentValue + utxos[index].value, depth + 1)

      // Branch 2: Exclude current UTXO (if we haven't found a good solution yet)
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
    const wastedValue = changeAbsorbed ? 0 : change > UtxoSelector.DUST_THRESHOLD ? 0 : change
    const efficiency = target / (totalValue + fee + wastedValue)
    return Math.min(1, efficiency)
  }
}

/**
 * Single Random Draw strategy - good for privacy
 */
export class SingleRandomDrawStrategy implements UtxoSelectionStrategy {
  name = 'SingleRandomDraw'

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Shuffle UTXOs for randomness
    const shuffledUtxos = [...utxos].sort(() => Math.random() - 0.5)

    for (const utxo of shuffledUtxos) {
      const fee = UtxoSelector.calculateFee(1, extraOutputs, feeRate)
      const required = targetValue + fee

      if (utxo.value >= required) {
        const change = utxo.value - required
        const hasChange = change > UtxoSelector.DUST_THRESHOLD
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
}

/**
 * Accumulative strategy - simple and reliable fallback
 */
export class AccumulativeStrategy implements UtxoSelectionStrategy {
  name = 'Accumulative'

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Sort by value descending for faster accumulation
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

    const selectedInputs: UTXO[] = []
    let currentValue = 0

    for (const utxo of sortedUtxos) {
      selectedInputs.push(utxo)
      currentValue += utxo.value

      const fee = UtxoSelector.calculateFee(selectedInputs.length, extraOutputs + 1, feeRate) // Assume change output
      const required = targetValue + fee

      if (currentValue >= required) {
        const change = currentValue - required
        const hasChange = change > UtxoSelector.DUST_THRESHOLD
        const finalOutputs = hasChange ? extraOutputs + 1 : extraOutputs
        const finalFee = UtxoSelector.calculateFee(selectedInputs.length, finalOutputs, feeRate)
        const finalChange = currentValue - targetValue - finalFee

        return {
          inputs: [...selectedInputs],
          changeAmount: finalChange > UtxoSelector.DUST_THRESHOLD ? finalChange : 0,
          fee: finalChange > UtxoSelector.DUST_THRESHOLD ? finalFee : finalFee + finalChange,
          efficiency: targetValue / (currentValue + finalFee),
          strategy: this.name,
        }
      }
    }

    return null
  }
}

/**
 * Largest First strategy - good for consolidation
 */
export class LargestFirstStrategy implements UtxoSelectionStrategy {
  name = 'LargestFirst'

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Sort by value descending
    const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)
    return new AccumulativeStrategy().select(sortedUtxos, targetValue, feeRate, extraOutputs)
  }
}

/**
 * Small First strategy - good for consolidating many small UTXOs
 */
export class SmallFirstStrategy implements UtxoSelectionStrategy {
  name = 'SmallFirst'

  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs: number = 1): UtxoSelectionResult | null {
    // Sort by value ascending to prioritize small UTXOs
    const sortedUtxos = [...utxos].sort((a, b) => a.value - b.value)

    const selectedInputs: UTXO[] = []
    let currentValue = 0

    for (const utxo of sortedUtxos) {
      selectedInputs.push(utxo)
      currentValue += utxo.value

      const fee = UtxoSelector.calculateFee(selectedInputs.length, extraOutputs + 1, feeRate) // Assume change output
      const required = targetValue + fee

      if (currentValue >= required) {
        const change = currentValue - required
        const hasChange = change > UtxoSelector.DUST_THRESHOLD
        const finalOutputs = hasChange ? extraOutputs + 1 : extraOutputs
        const finalFee = UtxoSelector.calculateFee(selectedInputs.length, finalOutputs, feeRate)
        const finalChange = currentValue - targetValue - finalFee

        return {
          inputs: [...selectedInputs],
          changeAmount: finalChange > UtxoSelector.DUST_THRESHOLD ? finalChange : 0,
          fee: finalChange > UtxoSelector.DUST_THRESHOLD ? finalFee : finalFee + finalChange,
          efficiency: targetValue / (currentValue + finalFee),
          strategy: this.name,
        }
      }
    }

    return null
  }
}
