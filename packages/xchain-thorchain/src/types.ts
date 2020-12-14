import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { Msg, AccAddress } from 'cosmos-client';
import { Coin, StdTxFee } from 'cosmos-client/api';

export type TransferAmount = {
  value: number
  denom: string
}

export type DepositParam = {
  asset?: Asset;
  amount: BaseAmount;
  memo: string
  fee?: StdTxFee
}

export const THORChain = 'THOR'
export const AssetRune: Asset = { chain: THORChain, symbol: 'RUNE', ticker: 'RUNE' }

export class MsgNativeTx extends Msg {
  coins: Coin[]
  memo: string
  signer: AccAddress;
  /**
   *
   * @param from_address
   * @param to_address
   * @param amount
   */
  constructor(coins: Coin[], memo: string, signer: AccAddress) {
    super()

    this.coins = coins
    this.memo = memo
    this.signer = signer
  }
  /**
   *
   * @param value
   */
  static fromJSON = (value: {coins: Coin[], memo: string, signer: string}): MsgNativeTx => {
    return new MsgNativeTx(value.coins, value.memo, AccAddress.fromBech32(value.signer));
  };
}
