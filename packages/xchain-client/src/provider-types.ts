import { Address, Asset } from '@xchainjs/xchain-util'

import { ExplorerProvider } from './explorer-provider'
import { Balance, Network, Tx, TxHash, TxHistoryParams, TxsPage } from './types'

export type Witness = {
  value: number
  script: Buffer
}
export type UTXO = {
  hash: string
  index: number
  value: number
  witnessUtxo?: Witness
  txHex?: string
  scriptPubKey?: string
}

export interface OnlineDataProvider {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>
  getTransactions(params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
}
export interface UtxoOnlineDataProvider extends OnlineDataProvider {
  getConfirmedUnspentTxs(address: Address): Promise<UTXO[]>
  getUnspentTxs(address: Address): Promise<UTXO[]>
  broadcastTx(txHex: string): Promise<TxHash>
}

export type ExplorerProviders = Record<Network, ExplorerProvider>
export type OnlineDataProviders = Record<Network, OnlineDataProvider | undefined>
export type UtxoOnlineDataProviders = Record<Network, UtxoOnlineDataProvider | undefined>
