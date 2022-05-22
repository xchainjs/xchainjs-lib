import { FeeOption, FeeRate, FeeRates, FeeBounds } from './types'

export function singleFeeRate(rate: FeeRate): FeeRates {
  return Object.values(FeeOption).reduce<Partial<FeeRates>>((a, x) => ((a[x] = rate), a), {}) as FeeRates
}

export function standardFeeRates(rate: FeeRate): FeeRates {
  return {
    ...singleFeeRate(rate),
    [FeeOption.Average]: rate * 0.5,
    [FeeOption.Fastest]: rate * 5.0,
  }
}

export function checkFeeBounds(feeBounds: FeeBounds, feeRate: FeeRate): void {
  if (feeRate < feeBounds.lower || feeRate > feeBounds.upper) {
    throw Error(`Fee outside of predetermined bounds: ${feeRate.toString()}`)
  }
}
