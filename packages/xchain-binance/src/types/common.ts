import { Balance as BaseBalance } from '@xchainjs/xchain-client'
import { Asset, TokenAsset } from '@xchainjs/xchain-util'

export type DerivePath = number[]

export type Balance = BaseBalance & {
  asset: Asset | TokenAsset
}
