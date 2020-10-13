import { AccAddress, Msg } from 'cosmos-client'
import { Coin } from 'cosmos-client/api'
import {
  Asset,
  THORChain,
} from '@thorchain/asgardex-util'

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

export declare const NETWORK_PREFIX_MAPPING: {
  readonly testnet: 'tthor'
  readonly mainnet: 'thor'
}

export type Network = keyof typeof NETWORK_PREFIX_MAPPING

export type Prefix = typeof NETWORK_PREFIX_MAPPING[Network]

export const AssetThor: Asset = { chain: THORChain, symbol: 'THOR', ticker: 'THOR' };
