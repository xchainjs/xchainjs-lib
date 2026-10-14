import {
  Balance as BaseBalance,
  FeeRates,
  Network,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxHistoryParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
} from '@xchainjs/xchain-client'
import { Address, Asset, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset

export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

export type TxFrom = BaseTxFrom & {
  asset?: CompatibleAsset
}

export type TxTo = BaseTxTo & {
  asset?: CompatibleAsset
}

export type Tx = BaseTx & {
  asset: CompatibleAsset
  from: TxFrom[]
  to: TxTo[]
}

export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}

export interface EvmOnlineDataProvider {
  getBalance(address: Address, assets?: CompatibleAsset[]): Promise<Balance[]>

  getTransactions(params: TxHistoryParams): Promise<TxsPage>

  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>

  getFeeRates(): Promise<FeeRates>
}

export type EvmOnlineDataProviders = Record<Network, EvmOnlineDataProvider | undefined>
