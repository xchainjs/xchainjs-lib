import {
  Balance as BaseBalance,
  ExplorerProviders,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxParams as BaseTxParams,
  TxTo as BaseTxTo,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, BaseAmount, TokenAsset } from '@xchainjs/xchain-util'

/**
 * Solana client params
 */
export type SOLClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}

export type CompatibleAsset = Asset | TokenAsset

export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
  priorityFee?: BaseAmount
  limit?: number
}

/**
 * Type definition for the sender of a Solana transaction.
 */
export type TxFrom = BaseTxFrom & {
  asset?: Asset | TokenAsset
}

/**
 * Type definition for the recipient of a Solana transaction.
 */
export type TxTo = BaseTxTo & {
  asset?: Asset | TokenAsset
}

/**
 * Type definition for a Solana transaction.
 */
export type Tx = BaseTx & {
  asset: Asset | TokenAsset
  from: TxFrom[]
  to: TxTo[]
}
