import { Balance, Network, Tx, TxHistoryParams, TxsPage } from '@xchainjs/xchain-client'
import { Address, Asset } from '@xchainjs/xchain-util'

import { ExplorerProvider } from './explorer-provider'

export interface OnlineDataProvider {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>
  getTransactions(params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
}
export type ExplorerProviders = Record<Network, ExplorerProvider>
export type OnlineDataProviders = Record<Network, OnlineDataProvider>
