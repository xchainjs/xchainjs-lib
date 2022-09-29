import { AssetRuneNative, baseAmount } from '@xchainjs/xchain-util/lib'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from '../crypto-amount'
import { LiquidityPool } from '../liquidity-pool'
import { Block, ILProtectionData, LiquidityToAdd, PoolShareDetail, PostionDepositValue, UnitData } from '../types'

/**
 * https://dev.thorchain.org/thorchain-dev/interface-guide/math#lp-units-add
 * @param liquidity - asset amount added
 * @param pool  - pool depths
 * @returns liquidity units - ownership of pool
 */
export const getLiquidityUnits = (liquidity: LiquidityToAdd, pool: LiquidityPool): BigNumber => {
  const P = new BigNumber(pool.pool.liquidityUnits)
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
    assetShare: new CryptoAmount(baseAmount(asset), pool.asset),
    runeShare: new CryptoAmount(baseAmount(rune), AssetRuneNative),
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
// Blocks for full protection 1440000 // 100 days
export const getLiquidityProtectionData = (
  depositValue: PostionDepositValue,
  poolShare: PoolShareDetail,
  block: Block,
): ILProtectionData => {
  //Coverage formula coverage=((A0∗P1)+R0)−((A1∗P1)+R1)=>((A0∗R1/A1)+R0)−(R1+R1)
  //formula: protectionProgress (currentHeight-heightLastAdded)/blocksforfullprotection
  const R0 = depositValue.rune.amount() // rune deposit value
  const A0 = depositValue.asset.amount() // asset deposit value
  const R1 = poolShare.runeShare.baseAmount.amount() // rune amount to redeem
  const A1 = poolShare.assetShare.baseAmount.amount() // asset amount to redeem
  const P1 = R1.div(A1) // Pool ratio at withdrawal
  const part1 = A0.times(P1).plus(R0).minus(A1.times(P1).plus(R1)) // start position minus end position
  const part2 = A0.times(R1.div(A1)).plus(R0).minus(R1.plus(R1)) // different way to check position
  const coverage = part1 >= part2 ? part1 : part2 // Coverage represents how much ILP a LP is entitled to
  const currentHeight = block.current
  const heightLastAdded = block.lastAdded || 0 //default to zero if undefined
  const blocksforfullprotection = block.fullProtection
  const protectionProgress = (currentHeight - heightLastAdded) / blocksforfullprotection // percentage of entitlement
  const result = coverage.times(protectionProgress) // impermanent loss protection result
  const ILProtection: ILProtectionData = {
    ILProtection: new CryptoAmount(baseAmount(result), AssetRuneNative),
    totalDays: (protectionProgress * 100).toFixed(2),
  }
  return ILProtection
}

/**
 * https://docs.thorchain.org/thorchain-finance/continuous-liquidity-pools#calculating-pool-ownership
 * @param liquidity - asset amount added
 * @param pool  - pool depths
 * @returns liquidity units - % ownership of pool
 */
export const getPoolOwnership = (liquidity: LiquidityToAdd, pool: LiquidityPool): number => {
  const P = new BigNumber(pool.pool.liquidityUnits)
  const r = liquidity.rune.amount()
  const a = liquidity.asset.amount()
  const R = pool.runeBalance.amount().plus(r) // Must add r first
  const A = pool.assetBalance.amount().plus(a) // Must add t first
  const part1 = R.plus(a)
  const part2 = r.times(A)

  const numerator = P.times(part1.plus(part2))
  const denominator = R.times(A).times(2)
  const lpUnits = numerator.div(denominator)
  const percent = lpUnits.div(P)
  return percent.toNumber()
}
