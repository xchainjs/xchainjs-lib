import {
  Balance as BaseBalance,
  FeeRates,
  Network,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxHash,
  TxHistoryParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
} from '@xchainjs/xchain-client'
import { Address, Asset } from '@xchainjs/xchain-util'

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

export type Balance = BaseBalance & {
  asset: Asset
}

export type TxFrom = BaseTxFrom & {
  asset?: Asset
}

export type TxTo = BaseTxTo & {
  asset?: Asset
}

export type Tx = BaseTx & {
  asset: Asset
  from: TxFrom[]
  to: TxTo[]
}

export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}

export interface UtxoOnlineDataProvider {
  getBalance(address: Address, confirmedOnly?: boolean): Promise<Balance[]>

  getTransactions(params: TxHistoryParams): Promise<TxsPage>

  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>

  getFeeRates(): Promise<FeeRates>

  getConfirmedUnspentTxs(address: Address): Promise<UTXO[]>

  getUnspentTxs(address: Address): Promise<UTXO[]>

  broadcastTx(txHex: string): Promise<TxHash>
}

export type UtxoOnlineDataProviders = Record<Network, UtxoOnlineDataProvider | undefined>
