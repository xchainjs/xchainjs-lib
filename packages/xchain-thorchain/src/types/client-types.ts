import { Tx, TxParams } from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

export type DepositParam = {
  walletIndex?: number
  asset?: Asset
  amount: BaseAmount
  memo: string
  gasLimit?: BigNumber
  sequence?: number
}

export type DepositTx = Omit<Tx, 'date'>

export type TxOfflineParams = TxParams & {
  gasLimit?: BigNumber
}
