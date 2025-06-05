import { TxParams as BaseTxParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, TokenAsset } from '@xchainjs/xchain-util'
import type BigNumber from 'bignumber.js'

export type CompatibleAsset = Asset | TokenAsset

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
}

export type TxOfflineParams = TxParams & {
  gasLimit?: BigNumber
}
