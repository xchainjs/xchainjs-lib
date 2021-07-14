/* eslint-disable ordered-imports/ordered-imports */
import { Asset, Chain } from '@xchainjs/xchain-util/lib'
import { Balance, Network, Tx, TxHistoryParams, TxsPage } from '../types'

export interface CanGetBalance {
  getBalance(network: Network, address: string, assets?: Asset[]): Promise<Balance[]>
}
export interface CanGetTransactions {
  getTransactions(network: Network, params?: TxHistoryParams): Promise<TxsPage>
}
export interface CanGetTransactionData {
  getTransactionData(network: Network, txId: string, assetAddress?: string): Promise<Tx>
}

export abstract class BaseProvider {
  protected chain: Chain
  constructor(chain: Chain) {
    this.chain = chain
  }
}

export type ProviderMap = {
  getBalance: CanGetBalance[]
  getTransactions: CanGetTransactions[]
  getTransactionData: CanGetTransactionData[]
}
export type ProviderParams = {
  getBalance?: CanGetBalance[]
  getTransactions?: CanGetTransactions[]
  getTransactionData?: CanGetTransactionData[]
}
