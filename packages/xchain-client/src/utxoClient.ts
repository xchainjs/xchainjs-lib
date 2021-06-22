import { Client, ClientParams, TxParams, Wallet } from './client'
import { FeeOption, Fees, TxHash } from './types'

export type FeeRate = number
export type FeeRates = Record<FeeOption, FeeRate>
export type FeesWithRates = { rates: FeeRates; fees: Fees }

export interface UTXOClient<ClientParamsType extends ClientParams, WalletType extends Wallet>
  extends Client<ClientParamsType, WalletType> {
  getFeesWithRates(memo?: string): Promise<FeesWithRates>
  getFeesWithMemo(memo: string): Promise<Fees>
  getFeeRates(): Promise<FeeRates>

  transfer(index: number, params: TxParams & { feeRate?: FeeRate }): Promise<TxHash>
  transfer(params: TxParams & { walletIndex?: number; feeRate?: FeeRate }): Promise<TxHash>
}
