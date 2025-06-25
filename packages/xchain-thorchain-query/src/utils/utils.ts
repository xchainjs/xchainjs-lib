import {
  // Address,
  Asset,
  AssetCryptoAmount,
  Chain,
  CryptoAmount,
  baseAmount,
  eqAsset,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CompatibleAsset, InboundDetail } from '../types'
import {
  AVAXChain,
  AssetATOM,
  AssetAVAX,
  AssetBASE,
  AssetBCH,
  AssetBSC,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetMAYA,
  AssetXRP,
  AssetRuneNative,
  BASEChain,
  BCHChain,
  BNBChain,
  BSCChain,
  BTCChain,
  DOGEChain,
  ETHChain,
  GAIAChain,
  LTCChain,
  MAYAChain,
  THORChain,
  XRPChain,
} from './const'

export const getBaseAmountWithDiffDecimals = (inputAmount: CryptoAmount, outDecimals: number): BigNumber => {
  const inDecimals = inputAmount.baseAmount.decimal
  let baseAmountOut = inputAmount.baseAmount.amount()
  const adjustDecimals = outDecimals - inDecimals
  baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
  return baseAmount(baseAmountOut, outDecimals).amount()
}

export const getCryptoAmountWithNotation = <T extends CompatibleAsset>(
  amount: CryptoAmount<T>,
  notation: number,
): CryptoAmount<T> => {
  const inputAmountBaseNotation = amount.baseAmount.amount()
  const decimalsDiff = notation - amount.baseAmount.decimal
  return new CryptoAmount<T>(baseAmount(inputAmountBaseNotation.times(10 ** decimalsDiff), notation), amount.asset)
}

/**
 * Returns the native asset for a given chain
 * @param chain
 * @returns the gas asset type for the given chain
 */
export const getChainAsset = (chain: Chain): Asset => {
  switch (chain) {
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
    case BSCChain:
      return AssetBSC
    case MAYAChain:
      return AssetMAYA
    case BASEChain:
      return AssetBASE
    case XRPChain:
      return AssetXRP
    default:
      throw Error('Unknown chain')
  }
}

/**
 *
 * @param asset
 * @returns a boolean based on Assets being compared are equal
 */
export const isNativeChainAsset = (asset: CompatibleAsset): asset is Asset => {
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
export const calcNetworkFee = (asset: CompatibleAsset, inbound: InboundDetail): AssetCryptoAmount => {
  // synths are always 0.02R fee
  if (isSynthAsset(asset)) return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)
  // if you are swapping a non-gas asset  on a multiAsset chain (ex. ERC-20 on ETH), the
  // gas fees will be paid in a diff asset than the one you are swapping

  switch (asset.chain) {
    case BTCChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetBTC)
    case BCHChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetBCH)
    case LTCChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetLTC)
    case DOGEChain:
      // NOTE: UTXO chains estimate fees with a 250 byte size
      return new AssetCryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetDOGE)
    case ETHChain:
      const gasRateinETHGwei = inbound.gasRate
      const gasRateinETHWei = baseAmount(gasRateinETHGwei.multipliedBy(10 ** 9), 18)
      if (eqAsset(asset, AssetETH)) {
        return new AssetCryptoAmount(gasRateinETHWei.times(21000), AssetETH)
      } else {
        return new AssetCryptoAmount(gasRateinETHWei.times(70000), AssetETH)
      }
    case AVAXChain:
      const gasRateinAVAXGwei = inbound.gasRate
      const gasRateinAVAXWei = baseAmount(gasRateinAVAXGwei.multipliedBy(10 ** 9), 18)
      if (eqAsset(asset, AssetAVAX)) {
        return new AssetCryptoAmount(gasRateinAVAXWei.times(21000), AssetAVAX)
      } else {
        return new AssetCryptoAmount(gasRateinAVAXWei.times(70000), AssetAVAX)
      }
    case GAIAChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate), AssetATOM)
    case THORChain:
      return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)
    case BSCChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate), AssetBSC)
    case MAYAChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate), AssetMAYA)
    case BASEChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate), AssetBASE)
    case XRPChain:
      return new AssetCryptoAmount(baseAmount(inbound.gasRate), AssetXRP)
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
export const calcOutboundFee = (asset: CompatibleAsset, inbound: InboundDetail): AssetCryptoAmount => {
  if (isSynthAsset(asset)) return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)
  switch (asset.chain) {
    case BTCChain:
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee), AssetBTC)
    case BCHChain:
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee), AssetBCH)
    case LTCChain:
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee), AssetLTC)
    case DOGEChain:
      // NOTE: UTXO chains estimate fees with a 250 byte size
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee), AssetDOGE)
    case ETHChain:
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee.multipliedBy(10 ** 9), 18), AssetETH)
    case AVAXChain:
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee.multipliedBy(10 ** 9), 18), AssetAVAX)
    case GAIAChain:
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee), AssetATOM)
    case BSCChain:
      return new AssetCryptoAmount(baseAmount(inbound.outboundFee), AssetBSC)
    case THORChain:
      return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)
    case MAYAChain:
      return new AssetCryptoAmount(baseAmount(2000000), AssetMAYA)
    case BASEChain:
      return new AssetCryptoAmount(baseAmount(2000000), AssetBASE)
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
    case 'BSC':
      return BSCChain
    case 'MAYA':
      return MAYAChain
    case 'BASE':
      return BASEChain
    case 'XRP':
      return XRPChain
    default:
      throw Error('Unknown chain')
  }
}
