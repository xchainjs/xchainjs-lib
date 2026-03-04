import {
  Balance as BaseBalance,
  ExplorerProviders,
  Network,
  Tx as BaseTx,
  TxParams as BaseTxParams,
  TxsPage as BaseTxsPage,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'

/**
 * Monero client params
 */
export type XMRClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  daemonUrls?: Record<Network, string[]>
}

export type Balance = BaseBalance & {
  asset: Asset
}

export type TxParams = BaseTxParams & {
  asset?: Asset
}

export type Tx = BaseTx & {
  asset: Asset
}

export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}
