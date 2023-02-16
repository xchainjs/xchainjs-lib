import { AVAXChain, AssetAVAX } from '@xchainjs/xchain-avax'
import { AssetBNB, BNBChain } from '@xchainjs/xchain-binance'
import { AssetBTC, BTCChain } from '@xchainjs/xchain-bitcoin'
import { AssetBCH, BCHChain } from '@xchainjs/xchain-bitcoincash'
import { AssetATOM, GAIAChain } from '@xchainjs/xchain-cosmos'
import { AssetDOGE, DOGEChain } from '@xchainjs/xchain-doge'
import { AssetETH, ETHChain } from '@xchainjs/xchain-ethereum'
import { AssetLTC, LTCChain } from '@xchainjs/xchain-litecoin'
import { AssetRuneNative, THORChain } from '@xchainjs/xchain-thorchain'
import {
  // Address,
  Asset,
  Chain,
  baseAmount,
  eqAsset,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from '../crypto-amount'
import { LiquidityPool } from '../liquidity-pool'
import { ThorchainCache } from '../thorchain-cache'
import { InboundDetail, SwapOutput } from '../types'

export const getBaseAmountWithDiffDecimals = (inputAmount: CryptoAmount, outDecimals: number): BigNumber => {
  const inDecimals = inputAmount.baseAmount.decimal
  let baseAmountOut = inputAmount.baseAmount.amount()
  const adjustDecimals = outDecimals - inDecimals
  baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
  return baseAmount(baseAmountOut, outDecimals).amount()
}

/**
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @param toRune - Direction of Swap. True if swapping to RUNE.
 * @returns
 */
export const getSwapFee = (inputAmount: CryptoAmount, pool: LiquidityPool, toRune: boolean): CryptoAmount => {
  // formula: (x * x * Y) / (x + X) ^ 2
  // const isInputRune = isAssetRuneNative(inputAmount.asset)
  const decimalsOut =
    pool.pool.nativeDecimal !== '-1' ? Number(pool.pool.nativeDecimal) : inputAmount.baseAmount.decimal

  const x = getBaseAmountWithDiffDecimals(inputAmount, 8)
  const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
  const Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount() // output is rune if toRune
  const units = toRune ? AssetRuneNative : pool.asset
  const numerator = x.times(x).multipliedBy(Y)
  const denominator = x.plus(X).pow(2)
  const result = numerator.div(denominator)

  const eightDecimalResult = new CryptoAmount(baseAmount(result), units)

  const decimals = toRune ? 8 : decimalsOut
  const baseOut = getBaseAmountWithDiffDecimals(eightDecimalResult, decimals)
  const swapFee = new CryptoAmount(baseAmount(baseOut, decimals), units)
  //console.log(` swapFee ${swapFee.assetAmountFixedString()} `)
  return swapFee
}

/**
 * Works out the swap slip for a given swap.
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @param toRune - Direction of Swap. True if swapping to RUNE.
 * @returns The amount of slip. Needs to * 100 to get percentage.
 */
export const getSwapSlip = (inputAmount: CryptoAmount, pool: LiquidityPool, toRune: boolean): BigNumber => {
  // formula: (x) / (x + X)
  const x = getBaseAmountWithDiffDecimals(inputAmount, 8)
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
export const getSwapOutput = (inputAmount: CryptoAmount, pool: LiquidityPool, toRune: boolean): CryptoAmount => {
  // formula: (x * X * Y) / (x + X) ^ 2
  const decimalsOut =
    pool.pool.nativeDecimal !== '-1' ? Number(pool.pool.nativeDecimal) : inputAmount.baseAmount.decimal
  const x = getBaseAmountWithDiffDecimals(inputAmount, 8)
  const X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount() // input is asset if toRune
  const Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount() // output is rune if toRune

  const units = toRune ? AssetRuneNative : pool.asset
  // const decimals = toRune || !pool.decimals ? 8 : pool.decimals
  const numerator = x.times(X).times(Y)
  const denominator = x.plus(X).pow(2)
  const result = numerator.div(denominator)

  const eightDecimalResult = new CryptoAmount(baseAmount(result), units)

  const decimals = toRune ? 8 : decimalsOut
  const baseOut = getBaseAmountWithDiffDecimals(eightDecimalResult, decimals)
  return new CryptoAmount(baseAmount(baseOut, decimals), units)
}

export const getDoubleSwapOutput = (
  inputAmount: CryptoAmount,
  pool1: LiquidityPool,
  pool2: LiquidityPool,
): CryptoAmount => {
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
export const getSingleSwap = (inputAmount: CryptoAmount, pool: LiquidityPool, toRune: boolean): SwapOutput => {
  const output = getSwapOutput(inputAmount, pool, toRune)
  const fee = getSwapFee(inputAmount, pool, toRune)
  const slip = getSwapSlip(inputAmount, pool, toRune)
  const swapOutput = {
    output: output,
    swapFee: fee,
    slip: slip,
  }
  return swapOutput
}
export const getDoubleSwapSlip = (inputAmount: CryptoAmount, pool1: LiquidityPool, pool2: LiquidityPool): BigNumber => {
  // formula: getSwapSlip1(input1) + getSwapSlip2(getSwapOutput1 => input2)
  const swapOutput1 = getSingleSwap(inputAmount, pool1, true)
  const swapOutput2 = getSingleSwap(swapOutput1.output, pool2, false)
  const result = swapOutput2.slip.plus(swapOutput1.slip)
  return result
}

export const getDoubleSwapFee = async (
  inputAmount: CryptoAmount,
  pool1: LiquidityPool,
  pool2: LiquidityPool,
  thorchainCache: ThorchainCache,
): Promise<CryptoAmount> => {
  // formula: getSwapFee1 + getSwapFee2
  const fee1InRune = getSwapFee(inputAmount, pool1, true)
  const swapOutput = getSwapOutput(inputAmount, pool1, true)
  const fee2InAsset = getSwapFee(swapOutput, pool2, false)
  const fee2InRune = await thorchainCache.convert(fee2InAsset, AssetRuneNative)
  const result = fee1InRune.plus(fee2InRune)
  return result
}

/**
 *
 * @param inputAmount - amount to swap
 * @param pool - Pool Data, RUNE and ASSET Depths
 * @param toRune - Direction of Swap. True if swapping to RUNE.
 * @returns swap output object - output - fee - slip
 */

export const getDoubleSwap = async (
  inputAmount: CryptoAmount,
  pool1: LiquidityPool,
  pool2: LiquidityPool,
  thorchainCache: ThorchainCache,
): Promise<SwapOutput> => {
  const doubleOutput = getDoubleSwapOutput(inputAmount, pool1, pool2)
  const doubleFee = await getDoubleSwapFee(inputAmount, pool1, pool2, thorchainCache)
  const doubleSlip = getDoubleSwapSlip(inputAmount, pool1, pool2)
  const SwapOutput = {
    output: doubleOutput,
    swapFee: doubleFee,
    slip: doubleSlip,
  }
  return SwapOutput
}

/**
 * Returns the native asset for a given chain
 * @param chain
 * @returns the gas asset type for the given chain
 */
export const getChainAsset = (chain: Chain): Asset => {
  switch (chain) {
    case BNBChain:
      return AssetBNB
    case BTCChain:
      return AssetBTC
    case ETHChain:
      return AssetETH
    case THORChain:
      return AssetRuneNative
    case GAIAChain:
      return AssetATOM
    case BCHChain:
      return AssetBCH
    case LTCChain:
      return AssetLTC
    case DOGEChain:
      return AssetDOGE
    case AVAXChain:
      return AssetAVAX
    default:
      throw Error('Unknown chain')
  }
}

/**
 *
 * @param asset
 * @returns a boolean based on Assets being compared are equal
 */
export const isNativeChainAsset = (asset: Asset): boolean => {
  return eqAsset(asset, getChainAsset(asset.chain))
}

/**
 * Works out the required inbound fee based on the chain.
 * Call getInboundDetails to get the current gasRate
 *
 * @param sourceAsset
 * @param gasRate
 * @see https://dev.thorchain.org/thorchain-dev/thorchain-and-fees#fee-calcuation-by-chain
 * @returns
 */
export const calcNetworkFee = (asset: Asset, inbound: InboundDetail): CryptoAmount => {
  // synths are always 0.02R fee
  if (asset.synth) return new CryptoAmount(baseAmount(2000000), AssetRuneNative)
  // if you are swapping a non-gas asset  on a multiAsset chain (ex. ERC-20 on ETH), the
  // gas fees will be paid in a diff asset than the one you are swapping

  switch (asset.chain) {
    case BTCChain:
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetBTC)
      break
    case BTCChain:
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetBCH)
      break
    case LTCChain:
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetLTC)
      break
    case DOGEChain:
      // NOTE: UTXO chains estimate fees with a 250 byte size
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetDOGE)
      break
    case BNBChain:
      //flat fee
      return new CryptoAmount(baseAmount(inbound.gasRate), AssetBNB)
      break
    case ETHChain:
      const gasRateinETHGwei = inbound.gasRate
      const gasRateinETHWei = baseAmount(gasRateinETHGwei.multipliedBy(10 ** 9), 18)
      if (eqAsset(asset, AssetETH)) {
        return new CryptoAmount(gasRateinETHWei.times(21000), AssetETH)
      } else {
        return new CryptoAmount(gasRateinETHWei.times(70000), AssetETH)
      }
      break
    case AVAXChain:
      const gasRateinAVAXGwei = inbound.gasRate
      const gasRateinAVAXWei = baseAmount(gasRateinAVAXGwei.multipliedBy(10 ** 9), 18)
      if (eqAsset(asset, AssetAVAX)) {
        return new CryptoAmount(gasRateinAVAXWei.times(21000), AssetAVAX)
      } else {
        return new CryptoAmount(gasRateinAVAXWei.times(70000), AssetAVAX)
      }
      break
    case GAIAChain:
      return new CryptoAmount(baseAmount(inbound.gasRate), AssetATOM)
      break
    case THORChain:
      return new CryptoAmount(baseAmount(2000000), AssetRuneNative)
      break
  }
  throw new Error(`could not calculate inbound fee for ${asset.chain}`)
}

/**
 * Works out the required outbound fee based on the chain.
 * Call getInboundDetails to get the current outbound fee
 *
 * @param sourceAsset
 * @param inbound detail
 * @see https://dev.thorchain.org/thorchain-dev/thorchain-and-fees#fee-calcuation-by-chain
 * @returns
 */
export const calcOutboundFee = (asset: Asset, inbound: InboundDetail): CryptoAmount => {
  if (asset.synth) return new CryptoAmount(baseAmount(2000000), AssetRuneNative)
  switch (asset.chain) {
    case BTCChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetBTC)
      break
    case BCHChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetBCH)
      break
    case LTCChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetLTC)
      break
    case DOGEChain:
      // NOTE: UTXO chains estimate fees with a 250 byte size
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetDOGE)
      break
    case BNBChain:
      //flat fee
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetBNB)
      break
    case ETHChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee.multipliedBy(10 ** 9), 18), AssetETH)
      break
    case AVAXChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee.multipliedBy(10 ** 9), 18), AssetAVAX)
      break
    case GAIAChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetATOM)
      break
    case THORChain:
      return new CryptoAmount(baseAmount(2000000), AssetRuneNative)
      break
  }
  throw new Error(`could not calculate outbound fee for ${asset.chain}`)
}

/**
 *
 * @param chain - input chain string
 * @returns - returns correct chain from string
 */
export const getChain = (chain: string): Chain => {
  switch (chain) {
    case 'AVAX':
      return AVAXChain
    case 'BNB':
      return BNBChain
    case 'BTC':
      return BTCChain
    case 'ETH':
      return ETHChain
    case 'THOR':
      return THORChain
    case 'GAIA':
      return GAIAChain
    case 'BCH':
      return BCHChain
    case 'LTC':
      return LTCChain
    case 'DOGE':
      return DOGEChain
    default:
      throw Error('Unknown chain')
  }
}
