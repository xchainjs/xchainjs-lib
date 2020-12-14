import { Asset, assetToString, baseAmount, assetFromString, THORChain } from '@xchainjs/xchain-util'
import { AssetRune, TransferAmount } from './types'
import { TxResponse, TxEvent, TxEventAttribute } from '@xchainjs/xchain-cosmos/lib'
import { Txs, TxFrom, TxTo } from '@xchainjs/xchain-client'

export const DECIMAL = 6

/**
 * Get denom from Asset
 */
export const getDenom = (v: Asset): string => {
  if (assetToString(v) === assetToString(AssetRune)) return 'rune'
  return v.symbol
}

/**
 * Get Asset from denom
 */
export const getAsset = (v: string): Asset | null => {
  if (v === getDenom(AssetRune)) return AssetRune
  return assetFromString(`${THORChain}.${v.toUpperCase()}`)
}

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
export const parseAmountString = (v: string): TransferAmount | undefined => {
  try {
    const value = parseInt(v)
    const denom = v.replace(value.toString(), '')
    return { value, denom }
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
          const amount = parseAmountString(amounts[i].value)
          if (recipient && sender && amount) {
            asset = getAsset(amount.denom)

            from.push({
              from: sender,
              amount: baseAmount(amount.value, DECIMAL),
            })
            to.push({
              to: recipient,
              amount: baseAmount(amount.value, DECIMAL),
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
