import {
  Balance as BaseBalance,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxParams as BaseTxParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
} from '@xchainjs/xchain-client'
import { Asset, SecuredAsset, SynthAsset, TokenAsset, TradeAsset } from '@xchainjs/xchain-util'
export type CompatibleAsset = Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset

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

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
}
