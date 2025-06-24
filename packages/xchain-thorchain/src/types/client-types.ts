import { CompatibleAsset, Tx, TxParams as BaseTxParams } from '@xchainjs/xchain-cosmos-sdk'
import { BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

export type DepositParam = {
  walletIndex?: number
  asset?: CompatibleAsset
  amount: BaseAmount
  memo: string
  gasLimit?: BigNumber
  sequence?: number
}

export type DepositTx = Omit<Tx, 'date'>

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
}

export type TxOfflineParams = TxParams & {
  gasLimit?: BigNumber
}

export type { CompatibleAsset }
