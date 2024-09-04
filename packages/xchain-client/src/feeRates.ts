import { FeeBounds, FeeOption, FeeRate, FeeRates } from './types'

/**
 * singleFeeRate function generates fee rates object with a single rate for all fee options.
 *
 * @param {FeeRate} rate The fee rate to be applied to all fee options.
 * @returns {FeeRates} The fee rates object with the provided rate for all fee options.
 */
export function singleFeeRate(rate: FeeRate): FeeRates {
  return Object.values(FeeOption).reduce<Partial<FeeRates>>((a, x) => ((a[x] = rate), a), {}) as FeeRates
}

/**
 * standardFeeRates function generates standard fee rates object based on a base rate.
 *
 * @param {FeeRate} rate The base fee rate to be applied to fee options.
 * @returns {FeeRates} The fee rates object with different rates for each fee option.
 */
export function standardFeeRates(rate: FeeRate): FeeRates {
  return {
    ...singleFeeRate(rate), // Include single fee rate for all fee options
    [FeeOption.Average]: rate * 0.5, // Set fee rate for average option as half of the base rate
    [FeeOption.Fastest]: rate * 5.0, // Set fee rate for fastest option as five times the base rate
  }
}

/**
 * checkFeeBounds function checks if the given fee rate falls within predetermined bounds.
 * Throws an error if the fee rate is outside the bounds.
 *
 * @param {FeeBounds} feeBounds The predetermined fee rate bounds.
 * @param {FeeRate} feeRate The fee rate to be checked.
 * @throws {Error} Thrown if the fee rate is outside the predetermined bounds.
 */
export function checkFeeBounds(feeBounds: FeeBounds, feeRate: FeeRate): void {
  if (feeRate < feeBounds.lower || feeRate > feeBounds.upper) {
    throw Error(`Fee outside of predetermined bounds: ${feeRate.toString()}`)
  }
}
