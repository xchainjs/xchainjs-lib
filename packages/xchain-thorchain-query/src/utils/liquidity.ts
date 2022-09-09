import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../liquidity-pool'
import { Block, LiquidityDeposited, PoolShareDetail, UnitData } from '../types'

/**
 *
 * @param liquidity - asset amount added
 * @param pool  - pool depths
 * @returns liquidity units - ownership of pool
 */
export const getLiquidityUnits = (liquidity: LiquidityDeposited, pool: LiquidityPool): BigNumber => {
  // formula: ((R + T) (r T + R t))/(4 R T)
  // part1 * (part2 + part3) / denominator
  const r = liquidity.runeDeposited.amount()
  const t = liquidity.assetDeposited.amount()
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

/**
 *
 * @param unitData - units for both asset and rune
 * @param pool - pool that the asset is bound to
 * @returns - pool share of both asset and rune in percentage
 */
export const getPoolShare = (unitData: UnitData, pool: LiquidityPool): PoolShareDetail => {
  // formula: (rune * part) / total; (asset * part) / total
  const units = unitData.liquidityUnits
  const total = unitData.totalUnits
  const R = pool.runeBalance.amount()
  const T = pool.assetBalance.amount()
  const asset = T.times(units).div(total)
  console.log(asset.toNumber())
  const rune = R.times(units).div(total)
  console.log(rune.toNumber())
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
export const getSlipOnLiquidity = (poolShare: PoolShareDetail, pool: LiquidityPool): BigNumber => {
  // formula: (t * R - T * r)/ (T*r + R*T)
  const r = poolShare.runeShare
  const t = poolShare.assetShare
  const R = pool.runeBalance.amount()
  const T = pool.assetBalance.amount()
  const numerator = t.times(R).minus(T.times(r))
  const denominator = T.times(r).plus(R.times(T))
  const result = numerator.div(denominator).abs()
  return result
}

/**
 *
 * @param poolShare - the share of asset and rune added to the pool
 * @param pool - Pool that the asset is attached to
 * @param block - blockl object with current, last added and the constant blocksforlossProtection
 * @returns
 */
// Blocks for full protection 144000 // 100 days
export const getLiquidityProtectionData = (poolShare: PoolShareDetail, pool: LiquidityPool, block: Block): number => {
  //formula: protectionProgress (currentHeight-heightLastAdded)/blocksforfullprotection
  const R0 = poolShare.runeShare // symetrical value of rune deposit
  const A0 = poolShare.assetShare // symetrical value of asset deposit
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
