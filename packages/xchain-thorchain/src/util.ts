import { Asset, assetToString, baseAmount, assetFromString, THORChain } from '@xchainjs/xchain-util'
import { AssetRune } from './types'
import { TxResponse, RawTxResponse } from '@xchainjs/xchain-cosmos'
import { Txs, TxFrom, TxTo, Fees, Network } from '@xchainjs/xchain-client'
import { AccAddress, codec, Msg } from 'cosmos-client'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import { StdTx } from 'cosmos-client/x/auth'

export const DECIMAL = 8
export const DEFAULT_GAS_VALUE = '10000000'

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (assetToString(asset) === assetToString(AssetRune)) return 'rune'
  return asset.symbol
}

/**
 * Get denomination with chainname from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination with chainname of the given asset.
 */
export const getDenomWithChain = (asset: Asset): string => {
  return `${THORChain}.${asset.symbol.toUpperCase()}`
}

/**
 * Get Asset from denomination
 *
 * @param {string} denom
 * @returns {Asset|null} The asset of the given denomination.
 */
export const getAsset = (denom: string): Asset | null => {
  if (denom === getDenom(AssetRune)) return AssetRune
  return assetFromString(`${THORChain}.${denom.toUpperCase()}`)
}

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
 * Response guard for transaction broadcast
 *
 * @param {any} response The response from the node.
 * @returns {boolean} `true` or `false`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBroadcastSuccess = (response: any): boolean => response.logs !== undefined

/**
 * Get address prefix based on the network.
 *
 * @param {string} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: string) => (network === 'testnet' ? 'tthor' : 'thor')

/**
 * Register Codecs based on the network.
 *
 * @param {Network}
 */
export const registerCodecs = (network: Network): void => {
  codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
  codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)

  const prefix = getPrefix(network)
  AccAddress.setBech32Prefix(
    prefix,
    prefix + 'pub',
    prefix + 'valoper',
    prefix + 'valoperpub',
    prefix + 'valcons',
    prefix + 'valconspub',
  )
}

/**
 * Parse transaction type
 *
 * @param {Array<TxResponse>} txs The transaction response from the node.
 * @param {Asset} mainAsset Current main asset which depends on the network.
 * @returns {Txs} The parsed transaction result.
 */
export const getTxsFromHistory = (txs: Array<TxResponse>, network: Network): Txs => {
  registerCodecs(network)

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
        asset: AssetRune,
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
 * Get the default fee.
 *
 * @returns {Fees} The default fee.
 */
export const getDefaultFees = (): Fees => {
  const fee = baseAmount(DEFAULT_GAS_VALUE, DECIMAL)
  return {
    type: 'base',
    fast: fee,
    fastest: fee,
    average: fee,
  }
}

/**
 * Get transaction type.
 *
 * @param {string} txData the transaction input data
 * @param {string} encoding `base64` or `hex`
 * @returns {string} the transaction type.
 */
export const getTxType = (txData: string, encoding: 'base64' | 'hex'): string => {
  return Buffer.from(txData, encoding).toString().slice(4)
}
