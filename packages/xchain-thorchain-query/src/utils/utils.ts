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
import type BigNumber from 'bignumber.js'

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
  AssetXRP,
  AssetSOL,
  AssetRuneNative,
  BASEChain,
  BCHChain,
  BSCChain,
  BTCChain,
  DOGEChain,
  ETHChain,
  GAIAChain,
  LTCChain,
  THORChain,
  XRPChain,
  SOLChain,
  TRONChain,
  AssetTRON,
  ZECChain,
  AssetZEC,
  THORCHAIN_DECIMAL,
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
    case BASEChain:
      return AssetBASE
    case XRPChain:
      return AssetXRP
    case SOLChain:
      return AssetSOL
    case TRONChain:
      return AssetTRON
    case ZECChain:
      return AssetZEC
    default:
      throw Error('Unknown chain')
  }
}

export const isNativeChainAsset = (asset: CompatibleAsset): asset is Asset => {
  return eqAsset(asset, getChainAsset(asset.chain))
}

/** THORChain protocol amounts are 1e8. Shift into the chain's native base units. */
export const fromThorBase = (amount: BigNumber, decimals: number): BigNumber => {
  const diff = decimals - THORCHAIN_DECIMAL
  if (diff === 0) return amount
  if (diff > 0) return amount.times(10 ** diff)
  return amount.div(10 ** -diff)
}

export const chainNativeDecimals = (chain: Chain): number => {
  switch (chain) {
    case ETHChain:
    case AVAXChain:
    case BSCChain:
    case BASEChain:
      return 18
    case GAIAChain:
    case XRPChain:
    case TRONChain:
      return 6
    case SOLChain:
      return 9
    default:
      return THORCHAIN_DECIMAL
  }
}

const EVM_NATIVE_GAS = 21000
const EVM_TOKEN_GAS = 70000

const evmWeiPerGasUnit = (chain: Chain, units: string): number => {
  if (units === 'mwei') return 1e6
  if (units === 'gwei' || units === 'nAVAX') return 1e9
  return chain === BASEChain ? 1e6 : 1e9
}

const feeAmount = (asset: Asset, amount: BigNumber, decimals: number): AssetCryptoAmount =>
  new AssetCryptoAmount(baseAmount(amount, decimals), asset)

const evmNetworkFee = (asset: CompatibleAsset, gasAsset: Asset, inbound: InboundDetail): AssetCryptoAmount => {
  const gas = eqAsset(asset, gasAsset) ? EVM_NATIVE_GAS : EVM_TOKEN_GAS
  const wei = inbound.gasRate.multipliedBy(evmWeiPerGasUnit(asset.chain, inbound.gasRateUnits)).multipliedBy(gas)
  return feeAmount(gasAsset, wei, 18)
}

/** gas_rate is already one native-unit fee. outbound_tx_size is 1 on these chains. */
const flatNativeFee = (asset: Asset, inbound: InboundDetail, decimals: number): AssetCryptoAmount => {
  const size = inbound.outboundTxSize.gt(0) ? inbound.outboundTxSize : inbound.outboundTxSize.plus(1)
  return feeAmount(asset, inbound.gasRate.multipliedBy(size), decimals)
}

const outboundNative = (asset: Asset, inbound: InboundDetail, decimals: number): AssetCryptoAmount =>
  feeAmount(asset, fromThorBase(inbound.outboundFee, decimals), decimals)

export const calcNetworkFee = (asset: CompatibleAsset, inbound: InboundDetail): AssetCryptoAmount => {
  if (isSynthAsset(asset)) return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)

  switch (asset.chain) {
    case BTCChain:
      return feeAmount(AssetBTC, inbound.gasRate.multipliedBy(inbound.outboundTxSize), 8)
    case BCHChain:
      return feeAmount(AssetBCH, inbound.gasRate.multipliedBy(inbound.outboundTxSize), 8)
    case LTCChain:
      return feeAmount(AssetLTC, inbound.gasRate.multipliedBy(inbound.outboundTxSize), 8)
    case DOGEChain:
      return feeAmount(AssetDOGE, inbound.gasRate.multipliedBy(inbound.outboundTxSize), 8)
    case ZECChain:
      // gasRate is the full ZIP-317 fee. Do not multiply by outboundTxSize.
      return feeAmount(AssetZEC, inbound.gasRate, 8)
    case ETHChain:
      return evmNetworkFee(asset, AssetETH, inbound)
    case AVAXChain:
      return evmNetworkFee(asset, AssetAVAX, inbound)
    case BSCChain:
      return evmNetworkFee(asset, AssetBSC, inbound)
    case BASEChain:
      return evmNetworkFee(asset, AssetBASE, inbound)
    case GAIAChain:
      return flatNativeFee(AssetATOM, inbound, 6)
    case XRPChain:
      return flatNativeFee(AssetXRP, inbound, 6)
    case SOLChain:
      return flatNativeFee(AssetSOL, inbound, 9)
    case TRONChain:
      return flatNativeFee(AssetTRON, inbound, 6)
    case THORChain:
      return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)
  }
  throw new Error(`could not calculate inbound fee for ${asset.chain}`)
}

/** outbound_fee from THORNode is 1e8. Native base units are 1e8 * 10^(decimals - 8). */
export const calcOutboundFee = (asset: CompatibleAsset, inbound: InboundDetail): AssetCryptoAmount => {
  if (isSynthAsset(asset)) return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)
  switch (asset.chain) {
    case BTCChain:
      return feeAmount(AssetBTC, inbound.outboundFee, 8)
    case BCHChain:
      return feeAmount(AssetBCH, inbound.outboundFee, 8)
    case LTCChain:
      return feeAmount(AssetLTC, inbound.outboundFee, 8)
    case DOGEChain:
      return feeAmount(AssetDOGE, inbound.outboundFee, 8)
    case ZECChain:
      return feeAmount(AssetZEC, inbound.outboundFee, 8)
    case ETHChain:
      return outboundNative(AssetETH, inbound, 18)
    case AVAXChain:
      return outboundNative(AssetAVAX, inbound, 18)
    case BSCChain:
      return outboundNative(AssetBSC, inbound, 18)
    case BASEChain:
      return outboundNative(AssetBASE, inbound, 18)
    case GAIAChain:
      return outboundNative(AssetATOM, inbound, 6)
    case XRPChain:
      return outboundNative(AssetXRP, inbound, 6)
    case SOLChain:
      return outboundNative(AssetSOL, inbound, 9)
    case TRONChain:
      return outboundNative(AssetTRON, inbound, 6)
    case THORChain:
      return new AssetCryptoAmount(baseAmount(2000000), AssetRuneNative)
  }
  throw new Error(`could not calculate outbound fee for ${asset.chain}`)
}

export const getChain = (chain: string): Chain => {
  switch (chain) {
    case 'AVAX':
      return AVAXChain
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
    case 'BASE':
      return BASEChain
    case 'XRP':
      return XRPChain
    case 'SOL':
      return SOLChain
    case 'TRON':
      return TRONChain
    case 'ZEC':
      return ZECChain
    default:
      throw Error('Unknown chain')
  }
}
