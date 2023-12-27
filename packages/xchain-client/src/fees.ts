import { Fee, FeeOption, FeeType, Fees } from './types'

export function singleFee(feeType: FeeType, amount: Fee): Fees {
  return Object.values(FeeOption).reduce<Partial<Fees>>((a, x) => ((a[x] = amount), a), {
    type: feeType,
  }) as Fees
}

export function standardFees(feeType: FeeType, amount: Fee): Fees {
  return {
    ...singleFee(feeType, amount),
    [FeeOption.Average]: amount.times(0.5),
    [FeeOption.Fastest]: amount.times(5.0),
  }
}
