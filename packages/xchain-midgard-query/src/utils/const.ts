import { AnyAsset, Asset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

export const AssetAVAX = assetFromStringEx('AVAX.AVAX') as Asset
export const AssetBTC = assetFromStringEx('BTC.BTC') as Asset
export const AssetATOM = assetFromStringEx('GAIA.ATOM') as Asset
export const AssetRuneNative = assetFromStringEx('THOR.RUNE') as Asset

export const BTCChain = 'BTC'
export const GAIAChain = 'GAIA'
export const AVAXChain = 'AVAX'

export const isAssetRuneNative = (asset: AnyAsset): boolean => assetToString(asset) === assetToString(AssetRuneNative)
