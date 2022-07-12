import { Address } from '@xchainjs/xchain-client'
import { strip0x } from '@xchainjs/xchain-ethereum'
import { Asset, AssetETH, BaseAmount, Chain, baseAmount, eqAsset } from '@xchainjs/xchain-util'
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

export const getValueOfAssetInRune = (inputAsset: BaseAmount, pool: LiquidityPool): BaseAmount => {
  // formula: ((a * R) / A) => R per A (Runeper$)
  const t = inputAsset.amount()
  const R = pool.runeBalance.amount()
  const A = pool.assetBalance.amount()
  const result = t.times(R).div(A)
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
export const getContractAddressFromAsset = (asset: Asset): Address => {
  const assetAddress = asset.symbol.slice(asset.ticker.length + 1)
  return strip0x(assetAddress)
}

/**
 * Works out the required inbound or outbound fee based on the chain.
 * Call getInboundDetails to get the current gasRate
 *
 * @param sourceAsset
 * @param gasRate
 * @see https://dev.thorchain.org/thorchain-dev/thorchain-and-fees#fee-calcuation-by-chain
 * @returns
 */
export const calcInboundFee = (sourceAsset: Asset, gasRate: BigNumber): BaseAmount => {
  switch (sourceAsset.chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Litecoin:
    case Chain.Doge:
      // NOTE: UTXO chains estimate fees with a 250 byte size
      return baseAmount(gasRate.multipliedBy(250))
      break
    case Chain.Binance:
      //flat fee
      return baseAmount(gasRate)
      break
    case Chain.Ethereum:
      if (eqAsset(sourceAsset, AssetETH)) {
        return baseAmount(gasRate.multipliedBy(35000).multipliedBy(10 ** 9))
      } else {
        return baseAmount(gasRate.multipliedBy(70000).multipliedBy(10 ** 9))
      }
      break
    case Chain.Terra:
      return baseAmount(gasRate)
      break
  }
  throw new Error(`could not calculate inbound fee for ${sourceAsset.chain}`)
}
