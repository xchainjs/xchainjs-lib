import { baseAmount } from '../asset'
import { BaseAmount } from '../types'
import { PoolData } from './swap'
import BigNumber from 'bignumber.js'

export type UnitData = {
  stakeUnits: BaseAmount
  totalUnits: BaseAmount
}

export type StakeData = {
  asset: BaseAmount
  rune: BaseAmount
}

export const getStakeUnits = (stake: StakeData, pool: PoolData): BaseAmount => {
  // formula: ((R + T) (r T + R t))/(4 R T)
  // part1 * (part2 + part3) / denominator
  const r = stake.rune.amount()
  const t = stake.asset.amount()
  const R = pool.runeBalance.amount().plus(r) // Must add r first
  const T = pool.assetBalance.amount().plus(t) // Must add t first
  const part1 = R.plus(T)
  const part2 = r.times(T)
  const part3 = R.times(t)
  const numerator = part1.times(part2.plus(part3))
  const denominator = R.times(T).times(4)
  const result = numerator.div(denominator)
  return baseAmount(result)
}

export const getPoolShare = (unitData: UnitData, pool: PoolData): StakeData => {
  // formula: (rune * part) / total; (asset * part) / total
  const units = unitData.stakeUnits.amount()
  const total = unitData.totalUnits.amount()
  const R = pool.runeBalance.amount()
  const T = pool.assetBalance.amount()
  const asset = T.times(units).div(total)
  const rune = R.times(units).div(total)
  const stakeData = {
    asset: baseAmount(asset),
    rune: baseAmount(rune),
  }
  return stakeData
}

export const getSlipOnStake = (stake: StakeData, pool: PoolData): BigNumber => {
  // formula: (t * R - T * r)/ (T*r + R*T)
  const r = stake.rune.amount()
  const t = stake.asset.amount()
  const R = pool.runeBalance.amount()
  const T = pool.assetBalance.amount()
  const numerator = t.times(R).minus(T.times(r))
  const denominator = T.times(r).plus(R.times(T))
  const result = numerator.div(denominator).abs()
  return result
}
