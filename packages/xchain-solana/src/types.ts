import {
  Balance as BaseBalance,
  ExplorerProviders,
  Network,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxParams as BaseTxParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, BaseAmount, TokenAsset } from '@xchainjs/xchain-util'

export type SOLClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  clientUrls?: Record<Network, string[]>
}

export type CompatibleAsset = Asset | TokenAsset

export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
  priorityFee?: BaseAmount
  limit?: number
  allowOwnerOffCurve?: boolean
}

export type TxFrom = BaseTxFrom & {
  asset?: Asset | TokenAsset
}

export type TxTo = BaseTxTo & {
  asset?: Asset | TokenAsset
}

export type Tx = BaseTx & {
  asset: Asset | TokenAsset
  from: TxFrom[]
  to: TxTo[]
}

export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}
