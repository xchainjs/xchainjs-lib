import { FeeBounds, FeeOption, FeeRate, FeeRates } from './types'

export function singleFeeRate(rate: FeeRate): FeeRates {
  return Object.values(FeeOption).reduce<Partial<FeeRates>>((a, x) => ((a[x] = rate), a), {}) as FeeRates
}

export function standardFeeRates(rate: FeeRate, feeBounds: FeeBounds = { lower: 1, upper: Infinity }): FeeRates {
  const result = {
    ...singleFeeRate(rate),
    [FeeOption.Average]: rate * 0.5,
    [FeeOption.Fastest]: rate * 5.0,
  }

  // sanity check fee rates 
  Object.values(result).forEach(it => {
    if (it < feeBounds.lower || it > feeBounds.upper) {
      throw Error(`Fee outside of predetermined bounds: ${it.toString()}`)
    } 
  }) 
  
  return result
}
