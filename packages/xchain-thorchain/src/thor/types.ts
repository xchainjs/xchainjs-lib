import { BigSource } from 'big.js'

import { AccAddress, Msg, PrivKey } from 'cosmos-client'
import { Coin } from 'cosmos-client/api'

export class MsgSend extends Msg {
  from_address: AccAddress
  to_address: AccAddress
  amount: Coin[]

  constructor(from_address: AccAddress, to_address: AccAddress, amount: Coin[]) {
    super()

    this.from_address = from_address
    this.to_address = to_address
    this.amount = amount
  }

  static fromJSON(value: any): MsgSend {
    return new MsgSend(AccAddress.fromBech32(value.from_address), AccAddress.fromBech32(value.to_address), value.amount)
  }
}

export type SearchTxParams = {
  messageAction?: string
  messageSender?: string
  page?: number
  limit?: number
  txMinHeight?: number
  txMaxHeight?: number
}

export type TransferParams = {
  privkey: PrivKey
  from: string
  to: string
  amount: BigSource
  asset: string
  memo?: string
}
