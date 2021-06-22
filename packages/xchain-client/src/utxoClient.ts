import { Client } from './client'
import { Delegate, DelegateFactory, TxParams } from './delegate'
import { ClientParams, FeeOption, Fees, TxHash } from './types'

export type FeeRate = number
export type FeeRates = Record<FeeOption, FeeRate>
export type FeesWithRates = { rates: FeeRates; fees: Fees }

export interface UTXODelegate<ClientParamsType extends ClientParams> extends Delegate<ClientParamsType> {
  getFeesWithRates(clientParams: Readonly<ClientParamsType>, memo?: string): Promise<FeesWithRates>
  getFeesWithMemo(clientParams: Readonly<ClientParamsType>, memo: string): Promise<Fees>
  getFeeRates(clientParams: Readonly<ClientParamsType>): Promise<FeeRates>

  transfer(clientParams: Readonly<ClientParamsType>, params: TxParams & { feeRate?: FeeRate }): Promise<TxHash>
}

export type UTXODelegateFactory<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DelegateType extends UTXODelegate<any>,
  UnlockParamsType extends unknown[]
> = DelegateFactory<DelegateType, UnlockParamsType>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class UTXOClient<DelegateFactoryType extends UTXODelegateFactory<any, any>> extends Client<DelegateFactoryType> {
  getFeesWithRates(memo?: string): Promise<FeesWithRates> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getFeesWithRates', ...[memo, Array.from(arguments).slice(1)])
  }
  getFeesWithMemo(memo: string): Promise<Fees> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getFeesWithMemo', memo, ...[memo, Array.from(arguments).slice(1)])
  }
  getFeeRates(): Promise<FeeRates> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getFeeRates', ...[Array.from(arguments).slice(0)])
  }

  transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getFeeRates', ...[params, Array.from(arguments).slice(1)])
  }
}
