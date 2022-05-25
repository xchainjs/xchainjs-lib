import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

// Pool data should come from midgard.ts issue #569.
export type PoolData = {
  assetBalance: BaseAmount
  runeBalance: BaseAmount
}

export type SwapOutput = {
  output: BaseAmount
  swapFee: BaseAmount
  slip: BigNumber
}

/**
 *
 * @param inputAmount
 * @param pool
 * @param toRune
 * @returns
 */
export const getSwapFee = (inputAmount: BaseAmount, pool: PoolData, toRune: boolean): BaseAmount => {
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
 *
 * @param inputAmount
 * @param pool
 * @param toRune
 * @returns
 */
export const getSwapSlip = (inputAmount: BaseAmount, pool: PoolData, toRune: boolean): BigNumber => {
  // formula: (x) / (x + X)
  const x = inputAmount.amount()
  const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
  const result = x.div(x.plus(X))
  return new BigNumber(result)
}

/**
 *
 * @param inputAmount
 * @param pool
 * @param toRune
 * @returns
 */
export const getSwapOutput = (inputAmount: BaseAmount, pool: PoolData, toRune: boolean): BaseAmount => {
  // formula: (x * X * Y) / (x + X) ^ 2
  const x = inputAmount.amount()
  const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
  const Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount() // output is rune if toRune
  const numerator = x.times(X).times(Y)
  const denominator = x.plus(X).pow(2)
  const result = numerator.div(denominator)
  return baseAmount(result)
}
/**
 *
 * @param inputAmount
 * @param pool
 * @returns
 */
export const getSingleSwap = (inputAmount: BaseAmount, pool: PoolData): SwapOutput => {
  const output = getSwapOutput(inputAmount, pool, false)
  const fee = getSwapFee(inputAmount, pool, false)
  const slip = getSwapSlip(inputAmount, pool, false)
  const SwapOutput = {
    output: output,
    swapFee: fee,
    slip: slip,
  }
  return SwapOutput
}

/**
 * Not sure if the below functions will be used.
 */

// export const getSwapOutputWithFee = (
//   inputAmount: BaseAmount,
//   pool: PoolData,
//   toRune: boolean,
//   transactionFee: BaseAmount = assetToBase(assetAmount(1)),
// ): BaseAmount => {
//   // formula: getSwapOutput() - one RUNE
//   const x = inputAmount.amount()
//   const r = getSwapOutput(inputAmount, pool, toRune)
//   const poolAfterTransaction: PoolData = toRune // used to get rune fee price after swap
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

// export const getSwapInput = (toRune: boolean, pool: PoolData, outputAmount: BaseAmount): BaseAmount => {
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

// export const getValueOfAssetInRune = (inputAsset: BaseAmount, pool: PoolData): BaseAmount => {
//   // formula: ((a * R) / A) => R per A (Runeper$)
//   const t = inputAsset.amount()
//   const R = pool.runeBalance.amount()
//   const A = pool.assetBalance.amount()
//   const result = t.times(R).div(A)
//   return baseAmount(result)
// }

// export const getValueOfRuneInAsset = (inputRune: BaseAmount, pool: PoolData): BaseAmount => {
//   // formula: ((r * A) / R) => A per R ($perRune)
//   const r = inputRune.amount()
//   const R = pool.runeBalance.amount()
//   const A = pool.assetBalance.amount()
//   const result = r.times(A).div(R)
//   return baseAmount(result)
// }

// export const getDoubleSwapOutput = (inputAmount: BaseAmount, pool1: PoolData, pool2: PoolData): BaseAmount => {
//   // formula: getSwapOutput(pool1) => getSwapOutput(pool2)
//   const r = getSwapOutput(inputAmount, pool1, true)
//   const output = getSwapOutput(r, pool2, false)
//   return output
// }

// export const getDoubleSwapOutputWithFee = (
//   inputAmount: BaseAmount,
//   pool1: PoolData,
//   pool2: PoolData,
//   transactionFee: BaseAmount = assetToBase(assetAmount(1)),
// ): BaseAmount => {
//   // formula: (getSwapOutput(pool1) => getSwapOutput(pool2)) - runeFee
//   const r = getSwapOutput(inputAmount, pool1, true)
//   const output = getSwapOutput(r, pool2, false)
//   const poolAfterTransaction: PoolData = {
//     runeBalance: baseAmount(pool2.runeBalance.amount().plus(r.amount())), // add RUNE output amount to pool
//     assetBalance: baseAmount(pool2.assetBalance.amount().minus(output.amount())), // subtract input amount from pool
//   }
//   const runeFee = getValueOfRuneInAsset(transactionFee, poolAfterTransaction) // asset(oneRune)
//   const result = output.amount().minus(runeFee.amount()) // remove asset(oneRune)
//   return baseAmount(result)
// }

// export const getDoubleSwapInput = (pool1: PoolData, pool2: PoolData, outputAmount: BaseAmount): BaseAmount => {
//   // formula: getSwapInput(pool2) => getSwapInput(pool1)
//   const y = getSwapInput(false, pool2, outputAmount)
//   const x = getSwapInput(true, pool1, y)
//   return x
// }

// export const getDoubleSwapSlip = (inputAmount: BaseAmount, pool1: PoolData, pool2: PoolData): BigNumber => {
//   // formula: getSwapSlip1(input1) + getSwapSlip2(getSwapOutput1 => input2)
//   const swapSlip1 = getSwapSlip(inputAmount, pool1, true)
//   const r = getSwapOutput(inputAmount, pool1, true)
//   const swapSlip2 = getSwapSlip(r, pool2, false)
//   const result = swapSlip1.plus(swapSlip2)
//   return result
// }

// export const getDoubleSwapFee = (inputAmount: BaseAmount, pool1: PoolData, pool2: PoolData): BaseAmount => {
//   // formula: getSwapFee1 + getSwapFee2
//   const fee1 = getSwapFee(inputAmount, pool1, true)
//   const r = getSwapOutput(inputAmount, pool1, true)
//   const fee2 = getSwapFee(r, pool2, false)
//   const fee1Asset = getValueOfRuneInAsset(fee1, pool2)
//   const result = fee2.amount().plus(fee1Asset.amount())
//   return baseAmount(result)
// }

// export const getValueOfAsset1InAsset2 = (inputAsset: BaseAmount, pool1: PoolData, pool2: PoolData): BaseAmount => {
//   // formula: (A2 / R) * (R / A1) => A2/A1 => A2 per A1 ($ per Asset)
//   const oneAsset = assetToBase(assetAmount(1))
//   // Note: All calculation needs to be done in `AssetAmount` (not `BaseAmount`)
//   const A2perR = baseToAsset(getValueOfRuneInAsset(oneAsset, pool2))
//   const RperA1 = baseToAsset(getValueOfAssetInRune(inputAsset, pool1))
//   const result = A2perR.amount().times(RperA1.amount())
//   // transform result back from `AssetAmount` into `BaseAmount`
//   return assetToBase(assetAmount(result))
// }
