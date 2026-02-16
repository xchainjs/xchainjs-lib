import { UTXO } from '../types'

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
