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
import { Asset, TokenAsset } from '@xchainjs/xchain-util'

export type NearClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  /**
   * JSON-RPC provider URLs per network (failover order).
   * Defaults are resolved in the Client when omitted so consumer overrides
   * are not shadowed by shallow-merged defaults.
   */
  clientUrls?: Record<Network, string[]>
  /** NearBlocks API base URLs for history / hash lookups. */
  nearblocksUrls?: Record<Network, string>
  /** Optional NearBlocks API key (`Authorization: Bearer …`). */
  nearblocksApiKey?: string
}

export type CompatibleAsset = Asset | TokenAsset

export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
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
