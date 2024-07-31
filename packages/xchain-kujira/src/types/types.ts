import { TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { Asset, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
}
