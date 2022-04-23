import {
  BaseXChainClient,
  Fees,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
} from '@xchainjs/xchain-client'

import { HavenClient } from './types/client-types'

class Client extends BaseXChainClient implements XChainClient, HavenClient {
  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }
  getAddress(walletIndex?: number): string {
    throw new Error('Method not implemented.')
  }
  getExplorerUrl(): string {
    throw new Error('Method not implemented.')
  }
  getExplorerAddressUrl(address: string): string {
    throw new Error('Method not implemented.')
  }
  getExplorerTxUrl(txID: string): string {
    throw new Error('Method not implemented.')
  }
  validateAddress(address: string): boolean {
    throw new Error('Method not implemented.')
  }
  getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    throw new Error('Method not implemented.')
  }
  getTransactionData(txId: string, assetAddress?: string): Promise<Tx> {
    throw new Error('Method not implemented.')
  }
  transfer(params: TxParams): Promise<TxHash> {
    throw new Error('Method not implemented.')
  }
  isSyncing(): boolean {
    return true
  }
  syncHeight(): number {
    return 0
  }
  blockHeight(): number {
    return 0
  }
}
