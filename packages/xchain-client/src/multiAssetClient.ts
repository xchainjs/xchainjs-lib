import { Asset } from '@xchainjs/xchain-util'

import { Client } from './client'
import { Delegate, DelegateFactory } from './delegate'
import { Address, Balance, ClientParams } from './types'

export interface MultiAssetDelegate<ClientParamsType extends ClientParams> extends Delegate<ClientParamsType> {
  getBalance(clientParams: Readonly<ClientParamsType>, address: Address, assets?: Asset[]): Promise<Balance[]>
}

export type MultiAssetDelegateFactory<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DelegateType extends MultiAssetDelegate<any>,
  UnlockParamsType extends unknown[]
> = DelegateFactory<DelegateType, UnlockParamsType>

export class MultiAssetClient<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DelegateFactoryType extends MultiAssetDelegateFactory<any, any>
> extends Client<DelegateFactoryType> {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getBalance', ...[address, assets, Array.from(arguments).slice(2)])
  }
}
