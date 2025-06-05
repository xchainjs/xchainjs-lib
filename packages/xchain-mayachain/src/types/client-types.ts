import { CompatibleAsset, Tx, TxParams as BaseTxParams } from '@xchainjs/xchain-cosmos-sdk'
import { BaseAmount } from '@xchainjs/xchain-util'
import type BigNumber from 'bignumber.js'

export type DepositParam = {
  walletIndex?: number
  asset?: CompatibleAsset
  amount: BaseAmount
  memo: string
  gasLimit?: BigNumber
  sequence?: number
}

export type DepositTx = Omit<Tx, 'date'>

export type TxOfflineParams = BaseTxParams & {
  gasLimit?: BigNumber
}

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
}

export { CompatibleAsset }
