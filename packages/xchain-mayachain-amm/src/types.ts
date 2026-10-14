import { QuoteMAYAName as BaseQuoteMAYAName } from '@xchainjs/xchain-mayachain-query'
import {
  Address,
  Asset,
  CryptoAmount,
  TokenAsset,
  TokenCryptoAmount,
  TradeAsset,
  TradeCryptoAmount,
} from '@xchainjs/xchain-util'

export type TxSubmitted = {
  hash: string
  url: string
}

export type ApproveParams = {
  asset: TokenAsset
  amount?: TokenCryptoAmount // undefined means infinite approval
}

export type IsApprovedParams = {
  asset: TokenAsset
  amount: TokenCryptoAmount
  address: Address
}

export type QuoteMAYAName = BaseQuoteMAYAName & {
  allowed: boolean
  errors: string[]
}

export type AddToTradeAccountParams = {
  amount: CryptoAmount<Asset | TokenAsset>
  address: Address
}

export type AddToTradeAccount = {
  toAddress: string
  memo: string
  value: CryptoAmount<Asset | TokenAsset | TradeAsset>
  allowed: boolean
  errors: string[]
}

export type WithdrawFromTradeAccountParams = {
  amount: TradeCryptoAmount
  address: Address
}

export type WithdrawFromTradeAccount = {
  memo: string
  value: CryptoAmount<Asset | TokenAsset | TradeAsset>
  allowed: boolean
  errors: string[]
}
