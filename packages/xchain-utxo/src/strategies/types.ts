import { UTXO } from '../types'

export interface UtxoSelectionStrategy {
  name: string
  select(utxos: UTXO[], targetValue: number, feeRate: number, extraOutputs?: number): UtxoSelectionResult | null
}

export interface UtxoSelectionResult {
  inputs: UTXO[]
  changeAmount: number
  fee: number
  efficiency: number // 0-1 score indicating how good this selection is
  strategy: string
}

export interface UtxoSelectionPreferences {
  minimizeFee?: boolean
  minimizeInputs?: boolean
  minimizeChange?: boolean
  avoidDust?: boolean
  consolidateSmallUtxos?: boolean
}
