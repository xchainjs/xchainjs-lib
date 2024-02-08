import { Fee, FeeOption, FeeType, Fees } from './types'

/**
 * singleFee function generates a fees object with a single fee amount for all fee options.
 *
 * @param {FeeType} feeType The type of fee.
 * @param {Fee} amount The fee amount to be applied to all fee options.
 * @returns {Fees} The fees object with the provided fee amount for all fee options.
 */
export function singleFee(feeType: FeeType, amount: Fee): Fees {
  return Object.values(FeeOption).reduce<Partial<Fees>>((a, x) => ((a[x] = amount), a), {
    type: feeType,
  }) as Fees;
}

/**
 * standardFees function generates standard fees object based on a base fee amount.
 *
 * @param {FeeType} feeType The type of fee.
 * @param {Fee} amount The base fee amount to be applied to fee options.
 * @returns {Fees} The fees object with different fee amounts for each fee option.
 */
export function standardFees(feeType: FeeType, amount: Fee): Fees {
  return {
    ...singleFee(feeType, amount), // Include single fee amount for all fee options
    [FeeOption.Average]: amount.times(0.5), // Set fee amount for average option as half of the base amount
    [FeeOption.Fastest]: amount.times(5.0), // Set fee amount for fastest option as five times the base amount
  };
}
