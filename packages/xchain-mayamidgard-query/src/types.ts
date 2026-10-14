import { GetActions200Response, ReverseTHORNames, THORNameDetails } from '@xchainjs/xchain-mayamidgard'

export type MAYANameDetails = THORNameDetails

export type ReverseMAYANames = ReverseTHORNames

export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
}

export type ActionType = 'swap' | 'addLiquidity' | 'withdraw' | 'donate' | 'refund' | 'switch'

export type GetActionsParams = Partial<{
  address: string
  txid: string
  asset: string
  type: ActionType
  affiliate: string
  limit: number
  offset: number
  nextPageToken: number
  timestamp: number
  height: number
  prevPageToken: number
  fromTimestamp: number
  fromHeight: number
}>

export type ActionHistory = GetActions200Response
