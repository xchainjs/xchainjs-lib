import { Asset, assetToString, baseAmount, assetFromString, THORChain } from '@xchainjs/xchain-util'
import { AssetRune } from './types'
import { TxResponse, TxEvent, TxEventAttribute } from '@xchainjs/xchain-cosmos'
import { Txs, TxFrom, TxTo, Balance, Fees } from '@xchainjs/xchain-client'

export const DECIMAL = 8
export const DEFAULT_GAS_VALUE = '10000000'

/**
 * Get denom from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denom of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (assetToString(asset) === assetToString(AssetRune)) return 'rune'
  return asset.symbol
}

/**
 * Get denom with chainname from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denom with chainname of the given asset.
 */
export const getDenomWithChain = (asset: Asset): string => {
  return `${THORChain}.${asset.symbol.toUpperCase()}`
}

/**
 * Get Asset from denom
 *
 * @param {string} denom
 * @returns {Asset|null} The asset of the given denom.
 */
export const getAsset = (denom: string): Asset | null => {
  if (denom === getDenom(AssetRune)) return AssetRune
  return assetFromString(`${THORChain}.${denom.toUpperCase()}`)
}

/**
 * Response guard for transaction broadcast
 *
 * @param {any} resopnse The response from the node.
 * @returns {boolean} `true` or `false`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBroadcastSuccess = (response: any): boolean => response.logs !== undefined

/**
 * Type guard for transfer event
 *
 * @param {TxEvent} txEvent The transaction event.
 * @returns {boolean} `true` or `false`.
 */
export const isTransferEvent = (txEvent: TxEvent): boolean => txEvent.type === 'transfer'

/**
 * Type guard for recipient attribute
 *
 * @param {TxEvent} txEventAttribute The transaction event attribute.
 * @returns {boolean} `true` or `false`.
 */
export const isRecipient = (txEventAttribute: TxEventAttribute): boolean => txEventAttribute.key === 'recipient'

/**
 * Type guard for sender attribute
 *
 * @param {TxEvent} txEventAttribute The transaction event attribute.
 * @returns {boolean} `true` or `false`.
 */
export const isSender = (txEventAttribute: TxEventAttribute): boolean => txEventAttribute.key === 'sender'

/**
 * Type guard for amount attribute
 *
 * @param {TxEvent} txEventAttribute The transaction event attribute.
 * @returns {boolean} `true` or `false`.
 */
export const isAmount = (txEventAttribute: TxEventAttribute): boolean => txEventAttribute.key === 'amount'

/**
 * Parse amount string to value and denom
 *
 * @param {string} amountStr The amount string.
 * @returns {Balance|undefined} The balance parsed from the amount string.
 */
export const parseAmountString = (amountStr: string): Balance | undefined => {
  try {
    const value = amountStr.match(/\d+/g)
    const denom = amountStr.match(/[a-z]+/g)
    if (value && denom && value.length === 1 && denom.length === 1) {
      const amount = baseAmount(value[0], DECIMAL)
      const asset = getAsset(denom[0])
      return asset ? { amount, asset } : undefined
    }
    return undefined
  } catch (e) {
    return undefined
  }
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
    const from: TxFrom[] = []
    const to: TxTo[] = []
    let asset
    tx.logs?.map((log) => {
      const attributes = log.events.find(isTransferEvent)?.attributes
      const recipients = attributes?.filter(isRecipient)
      const senders = attributes?.filter(isSender)
      const amounts = attributes?.filter(isAmount)
      if (recipients && senders && amounts) {
        for (let i = 0; i < Math.min(recipients.length, senders.length, amounts.length); i++) {
          const recipient = recipients[i].value
          const sender = senders[i].value
          const balance = parseAmountString(amounts[i].value)
          if (recipient && sender && balance) {
            asset = balance.asset

            from.push({
              from: sender,
              amount: balance.amount,
            })
            to.push({
              to: recipient,
              amount: balance.amount,
            })
          }
        }
      }
    })

    return [
      ...acc,
      {
        asset: asset || mainAsset,
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
