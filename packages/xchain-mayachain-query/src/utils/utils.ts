import {
  // Address,
  Asset,
  Chain,
  baseAmount,
  eqAsset,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from '../crypto-amount'
import { InboundDetail } from '../types'
// eslint-disable-next-line ordered-imports/ordered-imports
import {
  AVAXChain,
  AssetATOM,
  AssetAVAX,
  AssetBCH,
  AssetBNB,
  AssetBSC,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetCacaoNative,
  AssetCacao,
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
} from './const'

export const getBaseAmountWithDiffDecimals = (inputAmount: CryptoAmount, outDecimals: number): BigNumber => {
  const inDecimals = inputAmount.baseAmount.decimal
  let baseAmountOut = inputAmount.baseAmount.amount()
  const adjustDecimals = outDecimals - inDecimals
  baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
  return baseAmount(baseAmountOut, outDecimals).amount()
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
      return AssetCacao
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
      return AssetCacaoNative
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
  if (asset.synth) return new CryptoAmount(baseAmount(2000000), AssetCacao)
  // if you are swapping a non-gas asset  on a multiAsset chain (ex. ERC-20 on ETH), the
  // gas fees will be paid in a diff asset than the one you are swapping

  switch (asset.chain) {
    case BTCChain:
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetBTC)
    case BCHChain:
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetBCH)
    case LTCChain:
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetLTC)
    case DOGEChain:
      // NOTE: UTXO chains estimate fees with a 250 byte size
      return new CryptoAmount(baseAmount(inbound.gasRate.multipliedBy(inbound.outboundTxSize)), AssetDOGE)
    case BNBChain:
      //flat fee
      return new CryptoAmount(baseAmount(inbound.gasRate), AssetBNB)
    case ETHChain:
      const gasRateinETHGwei = inbound.gasRate
      const gasRateinETHWei = baseAmount(gasRateinETHGwei.multipliedBy(10 ** 9), 18)
      if (eqAsset(asset, AssetETH)) {
        return new CryptoAmount(gasRateinETHWei.times(21000), AssetETH)
      } else {
        return new CryptoAmount(gasRateinETHWei.times(70000), AssetETH)
      }
    case AVAXChain:
      const gasRateinAVAXGwei = inbound.gasRate
      const gasRateinAVAXWei = baseAmount(gasRateinAVAXGwei.multipliedBy(10 ** 9), 18)
      if (eqAsset(asset, AssetAVAX)) {
        return new CryptoAmount(gasRateinAVAXWei.times(21000), AssetAVAX)
      } else {
        return new CryptoAmount(gasRateinAVAXWei.times(70000), AssetAVAX)
      }
    case GAIAChain:
      return new CryptoAmount(baseAmount(inbound.gasRate), AssetATOM)
    case THORChain:
      return new CryptoAmount(baseAmount(2000000), AssetCacao)
    case BSCChain:
      return new CryptoAmount(baseAmount(inbound.gasRate), AssetBSC)
    case MAYAChain:
      return new CryptoAmount(baseAmount(inbound.gasRate), AssetCacaoNative)
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
  if (asset.synth) return new CryptoAmount(baseAmount(2000000), AssetCacao)
  switch (asset.chain) {
    case BTCChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetBTC)
    case BCHChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetBCH)
    case LTCChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetLTC)
    case DOGEChain:
      // NOTE: UTXO chains estimate fees with a 250 byte size
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetDOGE)
    case BNBChain:
      //flat fee
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetBNB)
    case ETHChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee.multipliedBy(10 ** 9), 18), AssetETH)
    case AVAXChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee.multipliedBy(10 ** 9), 18), AssetAVAX)
    case GAIAChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetATOM)
    case BSCChain:
      return new CryptoAmount(baseAmount(inbound.outboundFee), AssetBSC)
    case THORChain:
      return new CryptoAmount(baseAmount(2000000), AssetCacao)
    case MAYAChain:
      return new CryptoAmount(baseAmount(2000000), AssetCacaoNative)
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
    default:
      throw Error('Unknown chain')
  }
}
