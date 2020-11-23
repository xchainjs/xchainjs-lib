import { TxFrom, TxTo, Txs } from '@xchainjs/xchain-client'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'

import { Msg, codec } from 'cosmos-client'
import { StdTx } from 'cosmos-client/x/auth'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'

import { RawTxResponse, TxResponse, APIQueryParam } from './cosmos/types'
import { AssetAtom, AssetMuon } from './types'

/**
 * Type guard for MsgSend
 */
export const isMsgSend = (v: Msg): v is MsgSend =>
  (v as MsgSend)?.amount !== undefined &&
  (v as MsgSend)?.from_address !== undefined &&
  (v as MsgSend)?.to_address !== undefined

/**
 * Type guard for MsgMultiSend
 */
export const isMsgMultiSend = (v: Msg): v is MsgMultiSend =>
  (v as MsgMultiSend)?.inputs !== undefined && (v as MsgMultiSend)?.outputs !== undefined

/**
 * Get denom from Asset
 */
export const getDenom = (v: Asset): string => {
  if (assetToString(v) === assetToString(AssetAtom)) return 'uatom'
  if (assetToString(v) === assetToString(AssetMuon)) return 'umuon'
  return v.symbol
}

/**
 * Get Asset from denom
 */
export const getAsset = (v: string): Asset | null => {
  if (v === getDenom(AssetAtom)) return AssetAtom
  if (v === getDenom(AssetMuon)) return AssetMuon
  return null
}

/**
 * Parse transaction type
 */
export const getTxsFromHistory = (txs: Array<TxResponse>, mainAsset: Asset): Txs => {
  return txs.reduce((acc, tx) => {
    let msgs: Msg[] = []
    if ((tx.tx as RawTxResponse).body === undefined) {
      msgs = codec.fromJSONString(codec.toJSONString(tx.tx as StdTx)).msg
    } else {
      msgs = codec.fromJSONString(codec.toJSONString((tx.tx as RawTxResponse).body.messages))
    }

    const from: TxFrom[] = []
    const to: TxTo[] = []
    msgs.map((msg) => {
      if (isMsgSend(msg)) {
        const msgSend = msg as MsgSend
        const amount = msgSend.amount
          .map((coin) => baseAmount(coin.amount, 6))
          .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 6), baseAmount(0, 6))

        const from_index = from.findIndex((value) => value.from === msgSend.from_address.toBech32())
        if (from_index === -1) {
          from.push({
            from: msgSend.from_address.toBech32(),
            amount,
          })
        } else {
          from[from_index].amount = baseAmount(from[from_index].amount.amount().plus(amount.amount()), 6)
        }

        const to_index = to.findIndex((value) => value.to === msgSend.to_address.toBech32())
        if (to_index === -1) {
          to.push({
            to: msgSend.to_address.toBech32(),
            amount,
          })
        } else {
          to[to_index].amount = baseAmount(to[to_index].amount.amount().plus(amount.amount()), 6)
        }
      } else if (isMsgMultiSend(msg)) {
        const msgMultiSend = msg as MsgMultiSend

        msgMultiSend.inputs.map((input) => {
          const amount = input.coins
            .map((coin) => baseAmount(coin.amount, 6))
            .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 6), baseAmount(0, 6))
          const from_index = from.findIndex((value) => value.from === input.address)
          if (from_index === -1) {
            from.push({
              from: input.address,
              amount,
            })
          } else {
            from[from_index].amount = baseAmount(from[from_index].amount.amount().plus(amount.amount()), 6)
          }
        })

        msgMultiSend.outputs.map((output) => {
          const amount = output.coins
            .map((coin) => baseAmount(coin.amount, 6))
            .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 6), baseAmount(0, 6))
          const to_index = to.findIndex((value) => value.to === output.address)
          if (to_index === -1) {
            to.push({
              to: output.address,
              amount,
            })
          } else {
            to[to_index].amount = baseAmount(to[to_index].amount.amount().plus(amount.amount()), 6)
          }
        })
      }
    })

    return [
      ...acc,
      {
        asset: mainAsset,
        from,
        to,
        date: new Date(tx.timestamp),
        type: from.length > 0 || to.length > 0 ? 'transfer' : 'unknown',
        hash: tx.txhash || '',
      },
    ]
  }, [] as Txs)
}

/**
 * Get Query String
 */
export const getQueryString = (v: APIQueryParam): string => {
  return Object.keys(v)
    .filter((key) => key.length > 0)
    .map((key) => (v[key] == null ? key : `${key}=${encodeURIComponent(v[key].toString())}`))
    .join('&')
}
