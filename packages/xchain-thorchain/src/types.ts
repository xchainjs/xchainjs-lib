import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { Msg, AccAddress } from 'cosmos-client'

export type TransferAmount = {
  value: number
  denom: string
}

export type DepositParam = {
  asset?: Asset
  amount: BaseAmount
  memo: string
}

export const THORChain = 'THOR'
export const AssetRune: Asset = { chain: THORChain, symbol: 'RUNE', ticker: 'RUNE' }

export type MsgCoin = {
  asset: string
  amount: string
}

export class MsgNativeTx extends Msg {
  coins: MsgCoin[]
  memo: string
  signer: AccAddress
  /**
   *
   * @param from_address
   * @param to_address
   * @param amount
   */
  constructor(coins: MsgCoin[], memo: string, signer: AccAddress) {
    super()

    this.coins = coins
    this.memo = memo
    this.signer = signer
  }
  /**
   *
   * @param value
   */
  static fromJSON = (value: { coins: MsgCoin[]; memo: string; signer: string }): MsgNativeTx => {
    return new MsgNativeTx(value.coins, value.memo, AccAddress.fromBech32(value.signer))
  }
}
