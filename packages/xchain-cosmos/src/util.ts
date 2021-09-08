import { FeeType, Fees, Tx, TxFrom, TxTo, TxType } from '@xchainjs/xchain-client'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { proto } from 'cosmos-client'
import { StdTx } from 'cosmos-client/cjs/openapi/api'
import { codec } from 'cosmos-client/cjs/types'

import { APIQueryParam, RawTxResponse, TxResponse } from './cosmos/types'
import { AssetAtom, AssetMuon } from './types'

/**
 * The decimal for cosmos chain.
 */
export const DECIMAL = 6

// /**
//  * Type guard for MsgSend
//  *
//  * @param {Msg} msg
//  * @returns {boolean} `true` or `false`.
//  */
// export const isMsgSend = (msg: proto.cosmos.bank.v1beta1.Msg): msg is proto.cosmos.bank.v1beta1.MsgSend =>
//   (msg as proto.cosmos.bank.v1beta1.MsgSend)?.amount !== undefined &&
//   (msg as proto.cosmos.bank.v1beta1.MsgSend)?.from_address !== undefined &&
//   (msg as unknown as proto.cosmos.bank.v1beta1.MsgSend)?.to_address !== undefined

// /**
//  * Type guard for MsgMultiSend
//  *
//  * @param {Msg} msg
//  * @returns {boolean} `true` or `false`.
//  */
// export const isMsgMultiSend = (msg: proto.cosmos.bank.v1beta1.Msg): msg is proto.cosmos.bank.v1beta1.MsgMultiSend =>
//   (msg as proto.cosmos.bank.v1beta1.MsgMultiSend)?.inputs !== undefined &&
//   (msg as proto.cosmos.bank.v1beta1.MsgMultiSend)?.outputs !== undefined

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

const getCoinAmount = (coins?: proto.cosmos.base.v1beta1.ICoin[]) => {
  return coins
    ? coins
        .map((coin) => baseAmount(coin.amount || 0, 6))
        .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 6), baseAmount(0, 6))
    : baseAmount(0, 6)
}
/**
 * Parse transaction type
 *
 * @param {TxResponse[]} txs The transaction response from the node.
 * @param {Asset} mainAsset Current main asset which depends on the network.
 * @returns {Tx[]} The parsed transaction result.
 */
export const getTxsFromHistory = (txs: TxResponse[], mainAsset: Asset): Tx[] => {
  return txs.reduce((acc, tx) => {
    let msgs: proto.cosmos.bank.v1beta1.Msg[] = []
    if ((tx.tx as RawTxResponse).body === undefined) {
      msgs = codec.unpackCosmosAny(codec.packCosmosAny(tx.tx as StdTx)) as proto.cosmos.bank.v1beta1.Msg[]
    } else {
      const tmp = codec.packCosmosAny((tx.tx as RawTxResponse).body.messages)
      msgs = codec.unpackCosmosAny(tmp) as proto.cosmos.bank.v1beta1.Msg[]
    }

    console.log(msgs)

    const from: TxFrom[] = []
    const to: TxTo[] = []
    msgs.map((msg) => {
      if (msg instanceof proto.cosmos.bank.v1beta1.MsgSend) {
        const msgSend = msg as proto.cosmos.bank.v1beta1.MsgSend
        const amount = getCoinAmount(msgSend.amount)

        let from_index = -1

        from.forEach((value, index) => {
          if (value.from === msgSend.from_address.toString()) from_index = index
        })

        if (from_index === -1) {
          from.push({
            from: msgSend.from_address.toString(),
            amount,
          })
        } else {
          from[from_index].amount = baseAmount(from[from_index].amount.amount().plus(amount.amount()), 6)
        }

        let to_index = -1

        to.forEach((value, index) => {
          if (value.to === msgSend.to_address.toString()) to_index = index
        })

        if (to_index === -1) {
          to.push({
            to: msgSend.to_address.toString(),
            amount,
          })
        } else {
          to[to_index].amount = baseAmount(to[to_index].amount.amount().plus(amount.amount()), 6)
        }
      } else if (msg instanceof proto.cosmos.bank.v1beta1.MsgMultiSend) {
        const msgMultiSend = msg as proto.cosmos.bank.v1beta1.MsgMultiSend

        msgMultiSend.inputs.map((input) => {
          const amount = getCoinAmount(input.coins || [])

          let from_index = -1

          from.forEach((value, index) => {
            if (value.from === input.address) from_index = index
          })

          if (from_index === -1) {
            from.push({
              from: input.address || '',
              amount,
            })
          } else {
            from[from_index].amount = baseAmount(from[from_index].amount.amount().plus(amount.amount()), 6)
          }
        })

        msgMultiSend.outputs.map((output) => {
          const amount = getCoinAmount(output.coins || [])

          let to_index = -1

          to.forEach((value, index) => {
            if (value.to === output.address) to_index = index
          })

          if (to_index === -1) {
            to.push({
              to: output.address || '',
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
        type: from.length > 0 || to.length > 0 ? TxType.Transfer : TxType.Unknown,
        hash: tx.txhash || '',
      },
    ]
  }, [] as Tx[])
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

// /**
//  * Register message codecs.
//  *
//  * @returns {void}
//  */
// export const registerCodecs = () => {
//   codec.registerCodec('cosmos-sdk/MsgSend', MsgSend, MsgSend.fromJSON)
//   codec.registerCodec('cosmos-sdk/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
// }

/**
 * Get the default fee.
 *
 * @returns {Fees} The default fee.
 */
export const getDefaultFees = (): Fees => {
  return {
    type: FeeType.FlatFee,
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
