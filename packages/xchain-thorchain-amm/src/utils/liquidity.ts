import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../liquidity-pool'
import { Block, LiquidityData, UnitData } from '../types'

/**
 *
 * @param liquidity - asset amount added
 * @param pool  - pool depths
 * @returns liquidity units
 */
export const getLiquidityUnits = (liquidity: LiquidityData, pool: LiquidityPool): BaseAmount => {
  // formula: ((R + T) (r T + R t))/(4 R T)
  // part1 * (part2 + part3) / denominator
  const r = liquidity.rune.amount()
  const t = liquidity.asset.amount()
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

/**
 *
 * @param unitData
 * @param pool
 * @returns
 */
export const getPoolShare = (unitData: UnitData, pool: LiquidityPool): LiquidityData => {
  // formula: (rune * part) / total; (asset * part) / total
  const units = unitData.liquidityUnits.amount()
  const total = unitData.totalUnits.amount()
  const R = pool.runeBalance.amount()
  const T = pool.assetBalance.amount()
  const asset = T.times(units).div(total)
  const rune = R.times(units).div(total)
  const liquidityData = {
    asset: baseAmount(asset),
    rune: baseAmount(rune),
  }
  return liquidityData
}

/**
 *
 * @param liquidity
 * @param pool
 * @returns
 */
export const getSlipOnLiquidity = (liquidity: LiquidityData, pool: LiquidityPool): BigNumber => {
  // formula: (t * R - T * r)/ (T*r + R*T)
  const r = liquidity.rune.amount()
  const t = liquidity.asset.amount()
  const R = pool.runeBalance.amount()
  const T = pool.assetBalance.amount()
  const numerator = t.times(R).minus(T.times(r))
  const denominator = T.times(r).plus(R.times(T))
  const result = numerator.div(denominator).abs()
  return result
}

/**
 *
 * @param liquidity
 * @param pool
 * @param block
 * @returns
 */
// Blocks for full protection 144000 // 100 days
export const getLiquidityProtectionData = (liquidity: LiquidityData, pool: LiquidityPool, block: Block): number => {
  //formula: protectionProgress (currentHeight-heightLastAdded)/blocksforfullprotection
  const R0 = liquidity.rune.amount() // symetrical value of rune deposit
  const A0 = liquidity.asset.amount() // symetrical value of asset deposit
  const R1 = pool.runeBalance.amount() // rune to redeem
  const A1 = pool.assetBalance.amount() // asset to redeem
  const P1 = R1.div(A1) // Pool ratio at withdrawal
  const coverage = A0.times(P1).plus(R0).minus(A1.times(P1).plus(R1))
  const currentHeight = block.current
  const heightLastAdded = block.lastAdded
  const blocksforfullprotection = block.fullProtection
  const protectionProgress = (currentHeight - heightLastAdded) / blocksforfullprotection
  const result = protectionProgress * coverage.toNumber() // impermanent loss protection result
  return result
}
