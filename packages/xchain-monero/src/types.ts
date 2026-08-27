import {
  Balance as BaseBalance,
  ExplorerProviders,
  FeeOption,
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
  lwsUrls?: Record<Network, string[]>
  /** monero-wallet-rpc endpoints. Preferred for getBalance against a local monerod. */
  walletRpcUrls?: Record<Network, string[]>
  /** Block height to start scanning from when using daemon fallback (no LWS). Set to wallet creation height to avoid full chain scan. */
  restoreHeight?: number
}

export type Balance = BaseBalance & {
  asset: Asset
}

export type TxParams = BaseTxParams & {
  asset?: Asset
  /** Maps to monero-wallet-rpc transfer priority (Average=2, Fast=3, Fastest=4). */
  feeOption?: FeeOption
}

export type Tx = BaseTx & {
  asset: Asset
}

export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}
