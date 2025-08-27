import { Client } from './client'
import { toBitcoinJS } from './coininfo'
import { Balance, PreparedTx, Tx, TxFrom, TxParams, TxTo, TxsPage, UTXO, UtxoClientParams, Witness } from './types'

/**
 * Exported symbols from the `Client`, `UTXO`, `UtxoClientParams`, `Witness`, and `PreparedTx` modules.
 */
export { Client, toBitcoinJS }
export type { UTXO, UtxoClientParams, Witness, PreparedTx, Balance, Tx, TxsPage, TxParams, TxTo, TxFrom }

// Export new enhancement modules
export { UtxoError, UtxoErrorCode } from './errors'
export { UtxoTransactionValidator } from './validators'
export {
  UtxoSelector,
  type UtxoSelectionStrategy,
  type UtxoSelectionResult,
  type UtxoSelectionPreferences,
} from './utxo-selector'
