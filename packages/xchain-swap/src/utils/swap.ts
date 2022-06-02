import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../LiquidityPool'
import { SwapOutput } from '../types'

/**
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @param toRune - Direction of Swap. True if swapping to RUNE.
 * @returns
 */
export const getSwapFee = (inputAmount: BaseAmount, pool: LiquidityPool, toRune: boolean): BaseAmount => {
  // formula: (x * x * Y) / (x + X) ^ 2
  const x = inputAmount.amount()
  const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
  const Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount() // output is rune if toRune
  const numerator = x.times(x).multipliedBy(Y)
  const denominator = x.plus(X).pow(2)
  const result = numerator.div(denominator)
  return baseAmount(result)
}

/**
 * Works out the swap slip for a given swap.
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @param toRune - Direction of Swap. True if swapping to RUNE.
 * @returns The amount of slip. Needs to * 100 to get percentage.
 */
export const getSwapSlip = (inputAmount: BaseAmount, pool: LiquidityPool, toRune: boolean): BigNumber => {
  // formula: (x) / (x + X)
  const x = inputAmount.amount()
  const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
  const result = x.div(x.plus(X))
  return new BigNumber(result)
}

/**
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @param toRune - Direction of Swap. True if swapping to RUNE.
 * @returns The output amount
 */
export const getSwapOutput = (inputAmount: BaseAmount, pool: LiquidityPool, toRune: boolean): BaseAmount => {
  // formula: (x * X * Y) / (x + X) ^ 2
  const x = inputAmount.amount()
  const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
  const Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount() // output is rune if toRune
  const numerator = x.times(X).times(Y)
  const denominator = x.plus(X).pow(2)
  const result = numerator.div(denominator)
  return baseAmount(result)
}

export const getDoubleSwapOutput = (
  inputAmount: BaseAmount,
  pool1: LiquidityPool,
  pool2: LiquidityPool,
): BaseAmount => {
  // formula: getSwapOutput(pool1) => getSwapOutput(pool2)
  const r = getSwapOutput(inputAmount, pool1, true)
  const output = getSwapOutput(r, pool2, false)
  return output
}

/**
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @returns swap output object - output - fee - slip
 */
export const getSingleSwap = (inputAmount: BaseAmount, pool: LiquidityPool, toRune: boolean): SwapOutput => {
  const output = getSwapOutput(inputAmount, pool, toRune)
  const fee = getSwapFee(inputAmount, pool, toRune)
  const slip = getSwapSlip(inputAmount, pool, toRune)
  const SwapOutput = {
    output: output,
    swapFee: fee,
    slip: slip,
  }
  return SwapOutput
}
export const getDoubleSwapSlip = (inputAmount: BaseAmount, pool1: LiquidityPool, pool2: LiquidityPool): BigNumber => {
  // formula: getSwapSlip1(input1) + getSwapSlip2(getSwapOutput1 => input2)
  const swapOutput1 = getSingleSwap(inputAmount, pool1, true)
  const swapOutput2 = getSingleSwap(swapOutput1.output, pool2, false)
  const result = swapOutput2.slip.plus(swapOutput1.slip)
  return result
}
export const getValueOfRuneInAsset = (inputRune: BaseAmount, pool: LiquidityPool): BaseAmount => {
  // formula: ((r * A) / R) => A per R ($perRune)
  const r = inputRune.amount()
  const R = pool.runeBalance.amount()
  const A = pool.assetBalance.amount()
  const result = r.times(A).div(R)
  return baseAmount(result)
}
export const getDoubleSwapFee = (inputAmount: BaseAmount, pool1: LiquidityPool, pool2: LiquidityPool): BaseAmount => {
  // formula: getSwapFee1 + getSwapFee2
  const fee1 = getSwapFee(inputAmount, pool1, true)
  const r = getSwapOutput(inputAmount, pool1, true)
  const fee2 = getSwapFee(r, pool2, false)
  const fee1Asset = getValueOfRuneInAsset(fee1, pool2)
  const result = fee2.amount().plus(fee1Asset.amount())
  return baseAmount(result)
}

/**
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @param toRune - Direction of Swap. True if swapping to RUNE.
 * @returns swap output object - output - fee - slip
 */

export const getDoubleSwap = (inputAmount: BaseAmount, pool1: LiquidityPool, pool2: LiquidityPool): SwapOutput => {
  const doubleOutput = getDoubleSwapOutput(inputAmount, pool1, pool2)
  const doubleFee = getDoubleSwapFee(inputAmount, pool1, pool2)
  const doubleSlip = getDoubleSwapSlip(inputAmount, pool1, pool2)
  const SwapOutput = {
    output: doubleOutput,
    swapFee: doubleFee,
    slip: doubleSlip,
  }
  return SwapOutput
}

/**
 * Not sure if the below functions will be used.
 */

// export const getSwapOutputWithFee = (
//   inputAmount: BaseAmount,
//   pool: LiquidityPool,
//   toRune: boolean,
//   transactionFee: BaseAmount = assetToBase(assetAmount(1)),
// ): BaseAmount => {
//   // formula: getSwapOutput() - one RUNE
//   const x = inputAmount.amount()
//   const r = getSwapOutput(inputAmount, pool, toRune)
//   const poolAfterTransaction: LiquidityPool = toRune // used to get rune fee price after swap
//     ? {
//         assetBalance: baseAmount(pool.assetBalance.amount().plus(x)), // add asset input amount to pool
//         runeBalance: baseAmount(pool.runeBalance.amount().minus(r.amount())), // get input price in RUNE and subtract from pool
//       }
//     : {
//         runeBalance: baseAmount(pool.runeBalance.amount().plus(x)), // add RUNE input amount to pool
//         assetBalance: baseAmount(pool.assetBalance.amount().minus(r.amount())), // get input price in RUNE and subtract from pool
//       }
//   // eslint-disable-next-line @typescript-eslint/no-use-before-define
//   const runeFee = toRune ? transactionFee : getValueOfRuneInAsset(transactionFee, poolAfterTransaction) // toRune its one Rune else its asset(oneRune)
//   const result = r.amount().minus(runeFee.amount()) // remove oneRune, or remove asset(oneRune)

//   return baseAmount(result)
// }

// export const getSwapInput = (toRune: boolean, pool: LiquidityPool, outputAmount: BaseAmount): BaseAmount => {
//   // formula: (((X*Y)/y - 2*X) - sqrt(((X*Y)/y - 2*X)^2 - 4*X^2))/2
//   // (part1 - sqrt(part1 - part2))/2
//   const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
//   const Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount() // output is rune if toRune
//   const y = outputAmount.amount()
//   const part1 = X.times(Y).div(y).minus(X.times(2))
//   const part2 = X.pow(2).times(4)
//   const result = part1.minus(part1.pow(2).minus(part2).sqrt()).div(2)
//   return baseAmount(result)
// }

// export const getValueOfAssetInRune = (inputAsset: BaseAmount, pool: LiquidityPool): BaseAmount => {
//   // formula: ((a * R) / A) => R per A (Runeper$)
//   const t = inputAsset.amount()
//   const R = pool.runeBalance.amount()
//   const A = pool.assetBalance.amount()
//   const result = t.times(R).div(A)
//   return baseAmount(result)
// }

// export const getValueOfRuneInAsset = (inputRune: BaseAmount, pool: LiquidityPool): BaseAmount => {
//   // formula: ((r * A) / R) => A per R ($perRune)
//   const r = inputRune.amount()
//   const R = pool.runeBalance.amount()
//   const A = pool.assetBalance.amount()
//   const result = r.times(A).div(R)
//   return baseAmount(result)
// }

// export const getDoubleSwapOutputWithFee = (
//   inputAmount: BaseAmount,
//   pool1: LiquidityPool,
//   pool2: LiquidityPool,
//   transactionFee: BaseAmount = assetToBase(assetAmount(1)),
// ): BaseAmount => {
//   // formula: (getSwapOutput(pool1) => getSwapOutput(pool2)) - runeFee
//   const r = getSwapOutput(inputAmount, pool1, true)
//   const output = getSwapOutput(r, pool2, false)
//   const poolAfterTransaction: LiquidityPool = {
//     runeBalance: baseAmount(pool2.runeBalance.amount().plus(r.amount())), // add RUNE output amount to pool
//     assetBalance: baseAmount(pool2.assetBalance.amount().minus(output.amount())), // subtract input amount from pool
//   }
//   const runeFee = getValueOfRuneInAsset(transactionFee, poolAfterTransaction) // asset(oneRune)
//   const result = output.amount().minus(runeFee.amount()) // remove asset(oneRune)
//   return baseAmount(result)
// }

// export const getDoubleSwapInput = (pool1: LiquidityPool, pool2: LiquidityPool, outputAmount: BaseAmount): BaseAmount => {
//   // formula: getSwapInput(pool2) => getSwapInput(pool1)
//   const y = getSwapInput(false, pool2, outputAmount)
//   const x = getSwapInput(true, pool1, y)
//   return x
// }

// export const getDoubleSwapSlip = (inputAmount: BaseAmount, pool1: LiquidityPool, pool2: LiquidityPool): BigNumber => {
//   // formula: getSwapSlip1(input1) + getSwapSlip2(getSwapOutput1 => input2)
//   const swapSlip1 = getSwapSlip(inputAmount, pool1, true)
//   const r = getSwapOutput(inputAmount, pool1, true)
//   const swapSlip2 = getSwapSlip(r, pool2, false)
//   const result = swapSlip1.plus(swapSlip2)
//   return result
// }

// export const getDoubleSwapFee = (inputAmount: BaseAmount, pool1: LiquidityPool, pool2: LiquidityPool): BaseAmount => {
//   // formula: getSwapFee1 + getSwapFee2
//   const fee1 = getSwapFee(inputAmount, pool1, true)
//   const r = getSwapOutput(inputAmount, pool1, true)
//   const fee2 = getSwapFee(r, pool2, false)
//   const fee1Asset = getValueOfRuneInAsset(fee1, pool2)
//   const result = fee2.amount().plus(fee1Asset.amount())
//   return baseAmount(result)
// }

// export const getValueOfAsset1InAsset2 = (inputAsset: BaseAmount, pool1: LiquidityPool, pool2: LiquidityPool): BaseAmount => {
//   // formula: (A2 / R) * (R / A1) => A2/A1 => A2 per A1 ($ per Asset)
//   const oneAsset = assetToBase(assetAmount(1))
//   // Note: All calculation needs to be done in `AssetAmount` (not `BaseAmount`)
//   const A2perR = baseToAsset(getValueOfRuneInAsset(oneAsset, pool2))
//   const RperA1 = baseToAsset(getValueOfAssetInRune(inputAsset, pool1))
//   const result = A2perR.amount().times(RperA1.amount())
//   // transform result back from `AssetAmount` into `BaseAmount`
//   return assetToBase(assetAmount(result))
// }
