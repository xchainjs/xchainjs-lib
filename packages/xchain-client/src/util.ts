import { BaseAmount } from '@xchainjs/xchain-util/lib'
import { Fees, FeeType, FeeOption } from './types'

export function SingleFlatFee(amount: BaseAmount): Fees {
  return Object.values(FeeOption).reduce((a, x) => ((a[x] = amount), a), {
    type: FeeType.FlatFee,
  } as Fees)
}

export function SingleFeePerByte(amount: BaseAmount): Fees {
  return Object.values(FeeOption).reduce((a, x) => ((a[x] = amount), a), {
    type: FeeType.PerByte,
  } as Fees)
}
