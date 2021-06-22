import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import { Client, ClientParams, Wallet } from './client'
import { Address, Fees, TxHash } from './types'

export type SingleAndMultiFees = {
  single: Fees
  multi: Fees
}

export type MultiSendParams = {
  walletIndex?: number
  transactions: Array<{
    to: Address
    coins: Array<{
      asset: Asset
      amount: BaseAmount
    }>
  }>
  memo?: string
}

export interface MultiSendWallet extends Wallet {
  multiSend(index: number, params: MultiSendParams): Promise<TxHash>
}

export abstract class MultiSendClient<
  ClientParamsType extends ClientParams,
  WalletType extends MultiSendWallet
> extends Client<ClientParamsType, WalletType> {
  abstract getMultiSendFees(): Promise<Fees>
  abstract getSingleAndMultiFees(): Promise<SingleAndMultiFees>

  multiSend(index: number, params: MultiSendParams): Promise<TxHash>
  /**
   * @deprecated
   */
  multiSend(params: MultiSendParams & { walletIndex?: number }): Promise<TxHash>
  multiSend(
    indexOrParams: number | (MultiSendParams & { walletIndex?: number }),
    maybeParams?: MultiSendParams,
  ): Promise<TxHash> {
    const [index, params] = this.normalizeParams<MultiSendParams>(indexOrParams, maybeParams)
    if (this.wallet === null) throw new Error('client must be unlocked')
    if (!(Number.isSafeInteger(index) && index >= 0)) throw new Error('index must be a non-negative integer')
    return this.wallet.multiSend(index, params)
  }
}
