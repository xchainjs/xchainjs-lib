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

/**
 * Primary data / execution transport.
 *
 * - `grpc` (default): Sui Foundation fullnode gRPC (`fullnode.*.sui.io`). Required for public mainnet after JSON-RPC deprecation.
 * - `jsonRpc`: legacy JSON-RPC. Only works against private nodes that still enable JSON-RPC.
 */
export type SuiTransport = 'grpc' | 'jsonRpc'

export type SUIClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  /**
   * Primary node base URLs per network.
   *
   * With the default `transport: 'grpc'`, these are **gRPC** base URLs
   * (e.g. `https://fullnode.mainnet.sui.io:443`). The same host that previously
   * served JSON-RPC still works for gRPC.
   *
   * With `transport: 'jsonRpc'`, these are JSON-RPC URLs for private nodes that
   * still expose JSON-RPC.
   *
   * @deprecated Prefer `grpcUrls` / explicit `transport`. Still supported as the
   * primary URL map for backward compatibility with Asgardex and other consumers.
   */
  clientUrls?: Record<Network, string>
  /** gRPC fullnode base URLs. Defaults to Sui Foundation public fullnodes. */
  grpcUrls?: Record<Network, string>
  /** GraphQL RPC URLs used for historical transaction queries. */
  graphqlUrls?: Record<Network, string>
  /**
   * Primary transport. Defaults to `grpc`.
   * Use `jsonRpc` only for private infrastructure that still enables JSON-RPC.
   */
  transport?: SuiTransport
}

export type CompatibleAsset = Asset | TokenAsset

export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
  gasBudget?: BaseAmount
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
