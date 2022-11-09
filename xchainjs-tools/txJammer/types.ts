import { TxSubmitted } from '@xchainjs/xchain-thorchain-amm'

export enum JammerAction {
  addLp = 'addLp',
  withdrawLp = 'withdrawLp',
  swap = 'swap',
  transfer = 'transfer',
}

export type TxDetail = {
  date?: Date
  action?: string
  result?: TxSubmitted | string
  details?: any
}

export type SwapConfig = {
  sourceAssetString: string
  destAssetString: string
  weight: number
}
export type TransferConfig = {
  assetString: string
}
export type AddLpConfig = {
  runeAssetString: string
  pairedAssetString: string
  weight: number
}
export type ActionConfig = {
  action: JammerAction
  weight: number
}
