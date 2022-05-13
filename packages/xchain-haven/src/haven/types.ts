import { HavenTicker } from 'haven-core-js'
export { HavenTicker }

export enum NetTypes {
  mainnet,
  testnet,
  stagenet,
}

export type BalanceType = 'balance' | 'unlockedBalance' | 'lockedBalance'

export type HavenBalance = Record<HavenTicker, Record<BalanceType, string>>

export type SyncStats = {
  syncedHeight: number
  blockHeight: number
  syncProgress: number
  isSyncing: boolean
}

export interface SyncObserver {
  next(value: SyncStats): void
  error(err: string): void
  complete(value: SyncStats): void
}
