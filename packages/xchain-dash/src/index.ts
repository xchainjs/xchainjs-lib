/**
 * Exporting constants related to the Dash client module.
 */
export * from './const'

/**
 * Exporting the Dash client class.
 */
export * from './client'

/**
 * Exporting utility functions for the Dash client module.
 * - `buildTx`: Function to build a Dash transaction.
 * - `getPrefix`: Function to get the prefix for a given network.
 * - `validateAddress`: Function to validate a Dash address.
 */
export { buildTx, getPrefix, validateAddress } from './utils'
