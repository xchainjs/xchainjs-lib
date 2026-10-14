import { GetActions200Response } from '@xchainjs/xchain-midgard'
import { Address, Asset, CryptoAmount, SecuredAsset, SynthAsset, TokenAsset, TradeAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset

export type getSaver = {
  asset: Asset | TokenAsset
  address: Address
  height?: number
}

export type SaversPosition = {
  depositValue: CryptoAmount<Asset | TokenAsset>
  redeemableValue: CryptoAmount<Asset | TokenAsset>
  lastAddHeight: number
  percentageGrowth: number
  ageInYears: number
  ageInDays: number
  asset: Asset | TokenAsset
  errors: string[]
}

export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
}

export type ActionType = 'swap' | 'addLiquidity' | 'withdraw' | 'donate' | 'refund' | 'switch'

export type ActionTxType =
  | 'unknown'
  | 'add'
  | 'withdraw'
  | 'swap'
  | 'limitOrder'
  | 'outbound'
  | 'donate'
  | 'bond'
  | 'unbond'
  | 'leave'
  | 'yggdrasilFund'
  | 'yggdrasilReturn'
  | 'reserve'
  | 'refund'
  | 'migrate'
  | 'ragnarok'
  | 'switch'
  | 'noOp'
  | 'consolidate'
  | 'thorname'
  | 'loanOpen'
  | 'loanRepayment'

export type GetActionsParams = Partial<{
  address: string
  txid: string
  asset: string
  type: ActionType
  txType: ActionTxType
  affiliate: string
  limit: number
  offset: number
  nextPageToken: number
  timestamp: number
  height: number
  prevPageToken: number
  fromTimestamp: number
  fromHeight: number
}>

export type ActionHistory = GetActions200Response
