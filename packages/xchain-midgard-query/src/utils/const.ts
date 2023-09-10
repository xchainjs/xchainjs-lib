import { Asset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

export const AssetAVAX = assetFromStringEx('AVAX.AVAX')
export const AssetBTC = assetFromStringEx('BTC.BTC')
export const AssetATOM = assetFromStringEx('GAIA.ATOM')
export const AssetRuneNative = assetFromStringEx('THOR.RUNE')

export const BTCChain = 'BTC'
export const GAIAChain = 'GAIA'
export const AVAXChain = 'AVAX'

export const isAssetRuneNative = (asset: Asset): boolean => assetToString(asset) === assetToString(AssetRuneNative)
