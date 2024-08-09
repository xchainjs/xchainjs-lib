import {
  Balance as BaseBalance,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxParams as BaseTxParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
} from '@xchainjs/xchain-client'
import { Asset, SynthAsset, TokenAsset, TradeAsset } from '@xchainjs/xchain-util'
/**
 * Compatible tokens with Cosmos providers
 */
export type CompatibleAsset = Asset | TokenAsset | SynthAsset | TradeAsset

/**
 * Type definition for Cosmos balance.
 */
export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

/**
 * Type definition for the sender of a Cosmos transaction.
 */
export type TxFrom = BaseTxFrom & {
  asset?: CompatibleAsset
}

/**
 * Type definition for the recipient of a Cosmos transaction.
 */
export type TxTo = BaseTxTo & {
  asset?: CompatibleAsset
}

/**
 * Type definition for a Cosmos transaction.
 */
export type Tx = BaseTx & {
  asset: CompatibleAsset
  from: TxFrom[]
  to: TxTo[]
}

/**
 * Type definition for a page of Cosmos transactions.
 */
export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}

/**
 * TxParams for Cosmos transactions.
 */
export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
}
