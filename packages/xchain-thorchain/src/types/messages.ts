import { Msg, AccAddress } from 'cosmos-client'
import { StdTxFee } from 'cosmos-client/api'
import { StdSignature } from 'cosmos-client/x/auth'

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
}

/**
 * This creates MsgNativeTx from json.
 *
 * @param value
 * @returns {MsgNativeTx}
 */
export const msgNativeTxFromJson = (value: { coins: MsgCoin[]; memo: string; signer: string }): MsgNativeTx => {
  return new MsgNativeTx(value.coins, value.memo, AccAddress.fromBech32(value.signer))
}

export type AminoWrapping<T> = {
  type: string
  value: T
}

export type ThorchainDepositResponse = AminoWrapping<{
  msg: AminoWrapping<{
    coins: MsgCoin[]
    memo: string
    signer: string
  }>[]
  fee: StdTxFee
  signatures: StdSignature[]
  memo: string
  timeout_height: string
}>

export type TxResult = {
  observed_tx: {
    tx: {
      id: string
      chain: string
      from_address: string
      to_address: string
      coins: {
        asset: string
        amount: string
      }[]
      gas: {
        asset: string
        amount: string
      }[]
      memo: string
    }
    status: string
    signers: string[]
  }
  keysign_metric: {
    tx_id: string
    node_tss_times: null
  }
}
