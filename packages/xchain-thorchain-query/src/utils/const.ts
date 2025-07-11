import { AnyAsset, Asset, TokenAsset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

export const AssetAVAX = assetFromStringEx('AVAX.AVAX') as Asset
export const AssetBTC = assetFromStringEx('BTC.BTC') as Asset
export const AssetBCH = assetFromStringEx('BCH.BCH') as Asset
export const AssetETH = assetFromStringEx('ETH.ETH') as Asset
export const AssetDOGE = assetFromStringEx('DOGE.DOGE') as Asset
export const AssetLTC = assetFromStringEx('LTC.LTC') as Asset
export const AssetATOM = assetFromStringEx('GAIA.ATOM') as Asset
export const AssetMAYA = assetFromStringEx('MAYA.CACAO') as Asset
export const AssetBSC = assetFromStringEx('BSC.BNB') as Asset
export const AssetRuneNative = assetFromStringEx('THOR.RUNE') as Asset
export const assetUSDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48') as TokenAsset
export const AssetBNB = assetFromStringEx('BSC.BNB') as Asset
export const AssetBASE = assetFromStringEx('BASE.ETH') as Asset
export const AssetXRP = assetFromStringEx('XRP.XRP') as Asset

export const BNBChain = 'BNB'
export const BTCChain = 'BTC'
export const BCHChain = 'BCH'
export const ETHChain = 'ETH'
export const GAIAChain = 'GAIA'
export const DOGEChain = 'DOGE'
export const LTCChain = 'LTC'
export const AVAXChain = 'AVAX'
export const MAYAChain = 'MAYA'
export const BSCChain = 'BSC'
export const THORChain = 'THOR'
export const BASEChain = 'BASE'
export const XRPChain = 'XRP'

export const THORCHAIN_DECIMAL = 8

export const isAssetRuneNative = (asset: AnyAsset): boolean => assetToString(asset) === assetToString(AssetRuneNative)
