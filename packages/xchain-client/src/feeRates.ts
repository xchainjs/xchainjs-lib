import { FeeOption, FeeRate, FeeRates } from './types'

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
