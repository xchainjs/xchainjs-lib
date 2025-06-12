import {
  Balance as BaseBalance,
  ExplorerProviders,
  Tx as BaseTx,
  TxParams as BaseTxParams,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'

export type XRPClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}

export type CompatibleAsset = Asset

export type Balance = BaseBalance & { asset: CompatibleAsset }

export type Tx = BaseTx & {
  asset: Asset
}

export type TxParams = BaseTxParams & {
  asset?: Asset
}

export type SignedTransaction = {
  tx_blob: string
  hash?: string
}
