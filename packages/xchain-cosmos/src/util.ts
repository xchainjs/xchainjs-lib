import { proto } from '@cosmos-client/core'
import { FeeType, Fees, Network, Tx, TxFrom, TxTo, TxType } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, CosmosChain, baseAmount, eqAsset } from '@xchainjs/xchain-util'

import { AssetAtom, COSMOS_DECIMAL } from './const'
import { APIQueryParam, TxResponse } from './cosmos/types'
import { ChainIds, ClientUrls as ClientUrls } from './types'

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
  // IBC assets
  if (denom.startsWith('ibc/'))
    // Note: Don't use `assetFromString` here, it will interpret `/` as synth
    return {
      chain: CosmosChain,
      symbol: denom,
      // TODO (xchain-contributors)
      // Get readable ticker for IBC assets from denom #600 https://github.com/xchainjs/xchainjs-lib/issues/600
      // At the meantime ticker will be empty
      ticker: '',
      synth: false,
    }
  return null
}

/**
 * Parses amount from `ICoin[]`
 *
 * @param {ICoin[]} coinst List of coins
 *
 * @returns {BaseAmount} Coin amount
 */
const getCoinAmount = (coins: proto.cosmos.base.v1beta1.ICoin[]): BaseAmount =>
  coins
    .map((coin) => baseAmount(coin.amount || 0, COSMOS_DECIMAL))
    .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), COSMOS_DECIMAL), baseAmount(0, COSMOS_DECIMAL))

/**
 * Filters `ICoin[]` by given `Asset`
 *
 * @param {ICoin[]} coinst List of coins
 * @param {Asset} asset Asset to filter coins
 *
 * @returns {ICoin[]} Filtered list
 */
const getCoinsByAsset = (coins: proto.cosmos.base.v1beta1.ICoin[], asset: Asset): proto.cosmos.base.v1beta1.ICoin[] =>
  coins.filter(({ denom }) => {
    const coinAsset = !!denom ? getAsset(denom) : null
    return !!coinAsset ? eqAsset(coinAsset, asset) : false
  })

/**
 * Parses transaction history
 *
 * @param {TxResponse[]} txs The transaction response from the node.
 * @param {Asset} asset Asset to get history of transactions from
 *
 * @returns {Tx[]} List of transactions
 */
export const getTxsFromHistory = (txs: TxResponse[], asset: Asset): Tx[] => {
  return (
    txs
      // order list to have latest txs first in list
      .sort((a, b) => {
        if (a.timestamp === b.timestamp) return 0
        return a.timestamp > b.timestamp ? -1 : 1
      })
      .reduce((acc, tx) => {
        const msgs = tx.tx?.body.messages ?? []

        const from: TxFrom[] = []
        const to: TxTo[] = []
        msgs.map((msg) => {
          if (isMsgSend(msg)) {
            const msgSend = msg
            const coins = getCoinsByAsset(msgSend.amount, asset)
            const amount = getCoinAmount(coins)

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
              from[from_index].amount = baseAmount(
                from[from_index].amount.amount().plus(amount.amount()),
                COSMOS_DECIMAL,
              )
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
              to[to_index].amount = baseAmount(to[to_index].amount.amount().plus(amount.amount()), COSMOS_DECIMAL)
            }
          }
        })

        return [
          ...acc,
          {
            asset,
            from,
            to,
            date: new Date(tx.timestamp),
            type: from.length > 0 || to.length > 0 ? TxType.Transfer : TxType.Unknown,
            hash: tx.txhash || '',
          },
        ]
      }, [] as Tx[])
  )
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
    fast: baseAmount(750, COSMOS_DECIMAL),
    fastest: baseAmount(2500, COSMOS_DECIMAL),
    average: baseAmount(0, COSMOS_DECIMAL),
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
