import { Asset, assetToString, baseAmount, assetFromString, THORChain } from '@xchainjs/xchain-util'
import { AssetRune } from './types'
import { TxResponse, TxEvent, TxEventAttribute } from '@xchainjs/xchain-cosmos/lib'
import { Txs, TxFrom, TxTo, Balance, Fees } from '@xchainjs/xchain-client'

export const DECIMAL = 8
export const DEFAULT_GAS_VALUE = '10000000'

/**
 * Get denom from Asset
 */
export const getDenom = (v: Asset): string => {
  if (assetToString(v) === assetToString(AssetRune)) return 'rune'
  return v.symbol
}

/**
 * Get denom with chainname from Asset
 */
export const getDenomWithChain = (v: Asset): string => {
  return `${THORChain}.${v.symbol.toUpperCase()}`
}

/**
 * Get Asset from denom
 */
export const getAsset = (v: string): Asset | null => {
  if (v === getDenom(AssetRune)) return AssetRune
  return assetFromString(`${THORChain}.${v.toUpperCase()}`)
}

/**
 * Response guard for transaction broadcast
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBroadcastSuccess = (v: any): boolean => v.logs !== undefined

/**
 * Type guard for transfer event
 */
export const isTransferEvent = (v: TxEvent): boolean => v.type === 'transfer'

/**
 * Type guard for recipient attribute
 */
export const isRecipient = (v: TxEventAttribute): boolean => v.key === 'recipient'

/**
 * Type guard for sender attribute
 */
export const isSender = (v: TxEventAttribute): boolean => v.key === 'sender'

/**
 * Type guard for amount attribute
 */
export const isAmount = (v: TxEventAttribute): boolean => v.key === 'amount'

/**
 * Parse amount string to value and denom
 */
export const parseAmountString = (v: string): Balance | undefined => {
  try {
    const value = v.match(/\d+/g)
    const denom = v.match(/[a-z]+/g)
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

export const getDefaultFees = (): Fees => {
  const fee = baseAmount(DEFAULT_GAS_VALUE, DECIMAL)
  return {
    type: 'base',
    fast: fee,
    fastest: fee,
    average: fee,
  }
}
