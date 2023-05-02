import { Asset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

export const AssetBNB = assetFromStringEx('BNB.BNB')
export const AssetAVAX = assetFromStringEx('AVAX.AVAX')
export const AssetBTC = assetFromStringEx('BTC.BTC')
export const AssetBCH = assetFromStringEx('BCH.BCH')
export const AssetETH = assetFromStringEx('ETH.ETH')
export const AssetDOGE = assetFromStringEx('DOGE.DOGE')
export const AssetLTC = assetFromStringEx('LTC.LTC')
export const AssetATOM = assetFromStringEx('GAIA.ATOM')
export const AssetMAYA = assetFromStringEx('MAYA.CACAO')
export const AssetBSC = assetFromStringEx('BSC.BNB')
export const AssetRuneNative = assetFromStringEx('THOR.RUNE')

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

export const isAssetRuneNative = (asset: Asset): boolean => assetToString(asset) === assetToString(AssetRuneNative)
