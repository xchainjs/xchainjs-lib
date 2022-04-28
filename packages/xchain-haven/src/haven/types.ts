import { HavenTicker } from 'haven-core-js'
export { HavenTicker }

export enum NetTypes {
  mainnet,
  testnet,
  stagenet,
}

export type BalanceType = 'balance' | 'unlockedBalance' | 'lockedBalance'

export type HavenBalance = Record<HavenTicker, Record<BalanceType, string>>
