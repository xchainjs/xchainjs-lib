import { cosmosclient, proto } from '@cosmos-client/core'
import { FeeType, Fees, Network, Tx, TxFrom, TxTo, TxType } from '@xchainjs/xchain-client'
import { Asset, CosmosChain, baseAmount, eqAsset } from '@xchainjs/xchain-util'

import { DECIMAL } from './const'
import { APIQueryParam, RawTxResponse, TxResponse } from './cosmos/types'
import { AssetAtom, AssetMuon, ChainIds, ClientUrls as ClientUrls } from './types'

/**
 * Type guard for MsgSend
 *
 * @param {Msg} msg
 * @returns {boolean} `true` or `false`.
 */
export const isMsgSend = (msg: unknown): msg is proto.cosmos.bank.v1beta1.MsgSend =>
  (msg as proto.cosmos.bank.v1beta1.MsgSend)?.amount !== undefined &&
  (msg as proto.cosmos.bank.v1beta1.MsgSend)?.from_address !== undefined &&
  (msg as proto.cosmos.bank.v1beta1.MsgSend)?.to_address !== undefined

/**
 * Type guard for MsgMultiSend
 *
 * @param {Msg} msg
 * @returns {boolean} `true` or `false`.
 */
export const isMsgMultiSend = (msg: unknown): msg is proto.cosmos.bank.v1beta1.MsgMultiSend =>
  (msg as proto.cosmos.bank.v1beta1.MsgMultiSend)?.inputs !== undefined &&
  (msg as proto.cosmos.bank.v1beta1.MsgMultiSend)?.outputs !== undefined

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (eqAsset(asset, AssetAtom)) return 'uatom'
  if (eqAsset(asset, AssetMuon)) return 'umuon'
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
  // IBC assets
  if (denom.startsWith('ibc/'))
    // Note: Don't use `assetFromString` here, it will interpret `/` as synth
    return {
      chain: CosmosChain,
      symbol: denom.toUpperCase(),
      // TODO (xchain-contributors)
      // Get ticker (real asset name) from denom
      // At the meantime ticker will be empty
      ticker: '',
      synth: false,
    }
  return null
}

const getCoinAmount = (coins?: proto.cosmos.base.v1beta1.ICoin[]) => {
  return coins
    ? coins
        .map((coin) => baseAmount(coin.amount || 0, DECIMAL))
        .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), DECIMAL), baseAmount(0, DECIMAL))
    : baseAmount(0, DECIMAL)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let msgs: Array<proto.cosmos.bank.v1beta1.MsgSend | proto.cosmos.bank.v1beta1.MsgMultiSend>
    if ((tx.tx as RawTxResponse).body === undefined) {
      msgs = cosmosclient.codec.packAnyFromCosmosJSON(tx.tx).msg
    } else {
      msgs = cosmosclient.codec.packAnyFromCosmosJSON((tx.tx as RawTxResponse).body.messages)
    }

    const from: TxFrom[] = []
    const to: TxTo[] = []
    msgs.map((msg) => {
      if (isMsgSend(msg)) {
        const msgSend = msg
        const amount = getCoinAmount(msgSend.amount)

        let from_index = -1

        from.forEach((value, index) => {
          if (value.from === msgSend.from_address) from_index = index
        })

        if (from_index === -1) {
          from.push({
            from: msgSend.from_address,
            amount,
          })
        } else {
          from[from_index].amount = baseAmount(from[from_index].amount.amount().plus(amount.amount()), DECIMAL)
        }

        let to_index = -1

        to.forEach((value, index) => {
          if (value.to === msgSend.to_address) to_index = index
        })

        if (to_index === -1) {
          to.push({
            to: msgSend.to_address,
            amount,
          })
        } else {
          to[to_index].amount = baseAmount(to[to_index].amount.amount().plus(amount.amount()), DECIMAL)
        }
      } else if (isMsgMultiSend(msg)) {
        const msgMultiSend = msg

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
            from[from_index].amount = baseAmount(from[from_index].amount.amount().plus(amount.amount()), DECIMAL)
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
            to[to_index].amount = baseAmount(to[to_index].amount.amount().plus(amount.amount()), DECIMAL)
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

/**
 * Default client urls
 *
 * @returns {ClientUrls} The client urls for Cosmos.
 */
export const getDefaultClientUrls = (): ClientUrls => {
  const mainClientUrl = 'https://api.cosmos.network'
  // Note: In case anyone facing into CORS issue, try the following URLs
  // https://lcd-cosmos.cosmostation.io/
  // https://lcd-cosmoshub.keplr.app/
  // @see (Discord #xchainjs) https://discord.com/channels/838986635756044328/988096545926828082/988103739967688724
  return {
    [Network.Testnet]: 'https://rest.sentry-02.theta-testnet.polypore.xyz',
    [Network.Stagenet]: mainClientUrl,
    [Network.Mainnet]: mainClientUrl,
  }
}

/**
 * Default chain ids
 *
 * @returns {ChainIds} Chain ids for Cosmos.
 */
export const getDefaultChainIds = (): ChainIds => {
  const mainChainId = 'cosmoshub-4'
  return {
    [Network.Testnet]: 'theta-testnet-001',
    [Network.Stagenet]: mainChainId,
    [Network.Mainnet]: mainChainId,
  }
}
