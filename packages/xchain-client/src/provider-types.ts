import { Address, Asset } from '@xchainjs/xchain-util'

import { ExplorerProvider } from './explorer-provider'
import { Balance, FeeRates, Network, Tx, TxHistoryParams, TxsPage } from './types'

export interface OnlineDataProvider {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>
  getTransactions(params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
  getFeeRates(): Promise<FeeRates>
}

export type EvmOnlineDataProvider = OnlineDataProvider

export type ExplorerProviders = Record<Network, ExplorerProvider>
export type OnlineDataProviders = Record<Network, OnlineDataProvider | undefined>
export type EvmOnlineDataProviders = Record<Network, EvmOnlineDataProvider | undefined>
