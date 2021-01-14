import { TxFrom, TxTo, Txs, Fees } from '@xchainjs/xchain-client'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'

import { Msg, codec } from 'cosmos-client'
import { StdTx } from 'cosmos-client/x/auth'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'

import { RawTxResponse, TxResponse, APIQueryParam } from './cosmos/types'
import { AssetAtom, AssetMuon } from './types'

/**
 * The decimal for cosmos chain.
 */
export const DECIMAL = 6

/**
 * Type guard for MsgSend
 *
 * @param {Msg} msg
 * @returns {boolean} `true` or `false`.
 */
export const isMsgSend = (msg: Msg): msg is MsgSend =>
  (msg as MsgSend)?.amount !== undefined &&
  (msg as MsgSend)?.from_address !== undefined &&
  (msg as MsgSend)?.to_address !== undefined

/**
 * Type guard for MsgMultiSend
 *
 * @param {Msg} msg
 * @returns {boolean} `true` or `false`.
 */
export const isMsgMultiSend = (msg: Msg): msg is MsgMultiSend =>
  (msg as MsgMultiSend)?.inputs !== undefined && (msg as MsgMultiSend)?.outputs !== undefined

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (assetToString(asset) === assetToString(AssetAtom)) return 'uatom'
  if (assetToString(asset) === assetToString(AssetMuon)) return 'umuon'
  return asset.symbol
}

/**
 * Get Asset from denomination
 *
 * @param {string} denom
 * @returns {Asset|null} The asset of the given denomination.
 */
export const getAsset = (denom: string): Asset | null => {
  if (denom === getDenom(AssetAtom)) return AssetAtom
  if (denom === getDenom(AssetMuon)) return AssetMuon
  return null
}

/**
 * Parse transaction type
 *
 * @param {Array<TxResponse>} txs The transaction response from the node.
 * @param {Asset} mainAsset Current main asset which depends on the network.
 * @returns {Txs} The parsed transaction result.
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
 *
 * @param {APIQueryParam}
 * @returns {string} The query string.
 */
export const getQueryString = (params: APIQueryParam): string => {
  return Object.keys(params)
    .filter((key) => key.length > 0)
    .map((key) => (params[key] == null ? key : `${key}=${encodeURIComponent(params[key].toString())}`))
    .join('&')
}

/**
 * Get the default fee.
 *
 * @returns {Fees} The default fee.
 */
export const getDefaultFees = (): Fees => {
  return {
    type: 'base',
    fast: baseAmount(750, DECIMAL),
    fastest: baseAmount(2500, DECIMAL),
    average: baseAmount(0, DECIMAL),
  }
}

/**
 * Get address prefix based on the network.
 *
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = () => 'cosmos'
