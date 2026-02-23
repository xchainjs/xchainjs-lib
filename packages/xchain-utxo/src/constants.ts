/**
 * Standard UTXO constants used across the library
 */

/**
 * Bitcoin's standard dust threshold (546 satoshis)
 *
 * This is the minimum value for a UTXO to be considered economically spendable.
 * The value comes from Bitcoin Core's calculation:
 * - P2PKH output size: 34 bytes
 * - Cost to spend: 34 bytes × 3 sat/byte = 102 satoshis
 * - Dust threshold: 102 × 3 = 306 satoshis (theoretical)
 * - Bitcoin Core uses 546 for safety margin and worst-case scenarios
 *
 * Note: Different UTXO chains may have different dust thresholds
 */
export const DUST_THRESHOLD = 546 // satoshis

/**
 * Transaction size constants for fee calculation
 */
export const TX_SIZE_CONSTANTS = {
  /** Base transaction overhead in virtual bytes */
  BASE_TX_SIZE: 10,
  /** Approximate virtual bytes per P2WPKH input */
  BYTES_PER_INPUT: 68,
  /** Virtual bytes per P2WPKH output */
  BYTES_PER_OUTPUT: 31,
} as const

/**
 * Maximum reasonable amount (21M BTC equivalent in satoshis)
 * Used as a sanity check for transaction amounts
 */
export const MAX_REASONABLE_AMOUNT = '2100000000000000'

/**
 * Maximum decimal precision for UTXO-based cryptocurrencies
 *
 * Most UTXO chains (Bitcoin, Litecoin, Dogecoin, etc.) use 8 decimal places:
 * - 1 BTC = 100,000,000 satoshis (10^8)
 * - 1 LTC = 100,000,000 litoshi (10^8)
 * - 1 DOGE = 100,000,000 koinu (10^8)
 *
 * This differs from Ethereum tokens which can have up to 18 decimals
 */
export const MAX_UTXO_DECIMALS = 8
