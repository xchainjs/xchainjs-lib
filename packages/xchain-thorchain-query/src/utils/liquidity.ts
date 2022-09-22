import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../liquidity-pool'
import { Block, LiquidityToAdd, PoolShareDetail, PostionDepositValue, UnitData } from '../types'

/**
 * https://dev.thorchain.org/thorchain-dev/interface-guide/math#lp-units-add
 * @param liquidity - asset amount added
 * @param pool  - pool depths
 * @returns liquidity units - ownership of pool
 */
export const getLiquidityUnits = (liquidity: LiquidityToAdd, pool: LiquidityPool): BigNumber => {
  const P = new BigNumber(pool.pool.units)
  const r = liquidity.rune.amount()
  const a = liquidity.asset.amount()
  const R = pool.runeBalance.amount()
  const A = pool.assetBalance.amount()
  const part1 = R.times(a)
  const part2 = r.times(A)

  const numerator = P.times(part1.plus(part2))
  const denominator = R.times(A).times(2)
  const result = numerator.div(denominator)
  return result
}
/**
 *
 * @param unitData - units for both asset and rune
 * @param pool - pool that the asset is bound to
 * @returns - pool share of both asset and rune in percentage
 */
export const getPoolShare = (unitData: UnitData, pool: LiquidityPool): PoolShareDetail => {
  // formula: (rune * part) / total; (asset * part) / total
  const units = unitData.liquidityUnits.amount()
  const total = unitData.totalUnits.amount()
  const R = pool.runeBalance.amount()
  const T = pool.assetBalance.amount()
  const asset = T.times(units).div(total)
  const rune = R.times(units).div(total)
  const poolShareDetail = {
    assetShare: asset,
    runeShare: rune,
  }
  return poolShareDetail
}

/**
 *
 * @param poolShare - the share of asset and rune added to the pool
 * @param pool - Pool that the asset is attached to
 * @returns - returns bignumber representing a slip percentage
 */
export const getSlipOnLiquidity = (stake: LiquidityToAdd, pool: LiquidityPool): BigNumber => {
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

/**
 * https://docs.thorchain.org/thorchain-finance/continuous-liquidity-pools#impermanent-loss-protection
 * @param poolShare - the share of asset and rune added to the pool
 * @param pool - Pool that the asset is attached to
 * @param block - blockl object with current, last added and the constant blocksforlossProtection
 * @returns
 */
// Blocks for full protection 144000 // 100 days
export const getLiquidityProtectionData = (
  depositValue: PostionDepositValue,
  poolShare: PoolShareDetail,
  block: Block,
): number => {
  //Coverage formula coverage=((A0∗P1)+R0)−((A1∗P1)+R1)=>((A0∗R1/A1)+R0)−(R1+R1)
  //formula: protectionProgress (currentHeight-heightLastAdded)/blocksforfullprotection
  const R0 = depositValue.rune.amount() // rune deposit value
  const A0 = depositValue.asset.amount() // asset deposit value
  const R1 = poolShare.runeShare // rune amount to redeem
  const A1 = poolShare.assetShare // asset amount to redeem
  const P1 = R1.div(A1) // Pool ratio at withdrawal
  console.log(R0, A0, A1, R1, P1)
  const start = A0.times(P1)
  console.log(R0.plus(start), start, R0)
  const end = A1.times(P1).plus(R1)
  console.log(end.toNumber())
  const part1 = start.minus(end) // Coverage represents how much ILP a LP is entitled to
  // const part2 = A0.times(R1.div(A1)).plus(R0).minus(R1.plus(R1))
  console.log(part1.toNumber())
  const coverage = part1
  const currentHeight = block.current
  const heightLastAdded = block.lastAdded
  const blocksforfullprotection = block.fullProtection
  const protectionProgress = (currentHeight - heightLastAdded) / blocksforfullprotection // percentage of entitlement
  console.log(protectionProgress)
  const result = protectionProgress * coverage.toNumber() // impermanent loss protection result
  return result
}

/**
 *
 * @param liquidity - asset amount added
 * @param pool  - pool depths
 * @returns liquidity units - ownership of pool
 */
export const getPoolOwnership = (liquidity: LiquidityToAdd, pool: LiquidityPool): BigNumber => {
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
  return result
}
