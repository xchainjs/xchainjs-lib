import {
  Balance as BaseBalance,
  ExplorerProviders,
  TxParams as BaseTxParams,
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
