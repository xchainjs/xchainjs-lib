/* eslint-disable ordered-imports/ordered-imports */
import { Asset, Chain } from '@xchainjs/xchain-util/lib'
import { Balance, Network, Tx, TxHistoryParams, TxsPage } from '../types'

export interface Provider {
  getBalance(network: Network, address: string, assets?: Asset[]): Promise<Balance[]>
  getTransactions(network: Network, params?: TxHistoryParams): Promise<TxsPage>
  getTransactionData(network: Network, txId: string, assetAddress?: string): Promise<Tx>
}

export abstract class BaseProvider implements Provider {
  protected chain: Chain
  constructor(chain: Chain) {
    this.chain = chain
  }
  abstract getBalance(network: Network, address: string, assets?: Asset[]): Promise<Balance[]>
  abstract getTransactions(network: Network, params?: TxHistoryParams): Promise<TxsPage>
  abstract getTransactionData(network: Network, txId: string, assetAddress?: string): Promise<Tx>
}

export type ProviderMap = {
  getBalance: Provider[]
  getTransactions: Provider[]
  getTransactionData: Provider[]
}
export type ProviderParams = {
  getBalance?: Provider[]
  getTransactions?: Provider[]
  getTransactionData?: Provider[]
}
