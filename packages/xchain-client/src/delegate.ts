import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import { Address, Balance, ClientParams, Fees, Tx, TxHash, TxsPage } from './types'

export type TxHistoryParams = {
  address: Address
  offset?: number
  limit?: number
  startTime?: Date
  asset?: string
}

export type TxParams = {
  walletIndex: number
  asset?: Asset
  amount: BaseAmount
  recipient: Address
  memo?: string
}

export interface Delegate<ClientParamsType extends ClientParams> {
  purge?(): Promise<void>

  validateAddress(clientParams: Readonly<ClientParams>, address: Address): Promise<boolean>

  getAddress(clientParams: Readonly<ClientParamsType>, walletIndex?: number): Promise<Address>
  getBalance(clientParams: Readonly<ClientParamsType>, address: Address): Promise<Balance[]>
  getTransactions(clientParams: Readonly<ClientParamsType>, params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(clientParams: Readonly<ClientParamsType>, txId: string): Promise<Tx>
  getFees(clientParams: Readonly<ClientParamsType>): Promise<Fees>

  transfer(clientParams: Readonly<ClientParamsType>, params: TxParams): Promise<TxHash>
}

export type DelegateClientParamsType<T> = T extends Delegate<infer R> ? R : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DelegateFactory<DelegateType extends Delegate<any>, UnlockParamsType extends unknown[]> = (
  ...args: UnlockParamsType
) => Promise<DelegateType>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DelegateFactoryDelegateType<T> = T extends DelegateFactory<infer R, any> ? R : never
export type DelegateFactoryClientParamsType<T> = DelegateClientParamsType<DelegateFactoryDelegateType<T>>
