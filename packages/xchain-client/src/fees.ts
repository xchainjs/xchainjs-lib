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

export function calcFees<T, U extends unknown[]>(
  feeRates: Record<FeeOption, T>,
  calcFee: (feeRate: T, ...args: U) => Fee,
  ...args: U
): Fees {
  return (Object.entries(feeRates) as Array<[FeeOption, T]>)
    .map(([k, v]) => [k, calcFee(v, ...args)] as const)
    .reduce<Partial<Fees>>((a, [k, v]) => ((a[k] = v), a), { type: FeeType.PerByte }) as Fees
}

export async function calcFeesAsync<T, U extends unknown[]>(
  feeRates: Record<FeeOption, T>,
  calcFee: (feeRate: T, ...args: U) => Fee,
  ...args: U
): Promise<Fees> {
  return (
    await Promise.all(
      (Object.entries(feeRates) as Array<[FeeOption, T]>).map(
        async ([k, v]) => [k, await calcFee(v, ...args)] as const,
      ),
    )
  ).reduce<Partial<Fees>>((a, [k, v]) => ((a[k] = v), a), { type: FeeType.PerByte }) as Fees
}
