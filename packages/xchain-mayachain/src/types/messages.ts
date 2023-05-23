import cosmosclient from '@cosmos-client/core'
import { Asset } from '@xchainjs/xchain-util'

export type MsgCoin = {
  asset: Asset
  amount: string
}

export class MsgNativeTx {
  coins: MsgCoin[]
  memo: string
  signer: cosmosclient.AccAddress

  constructor(coins: MsgCoin[], memo: string, signer: cosmosclient.AccAddress) {
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
  return new MsgNativeTx(value.coins, value.memo, cosmosclient.AccAddress.fromString(value.signer))
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
  fee: cosmosclient.proto.cosmos.tx.v1beta1.Fee
  signatures: string[]
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
