import { Asset, assetFromStringEx } from '@xchainjs/xchain-util'

export const BtcAsset = assetFromStringEx('BTC.BTC') as Asset
export const EthAsset = assetFromStringEx('ETH.ETH') as Asset
export const CacaoAsset = assetFromStringEx('MAYA.CACAO') as Asset
export const RuneAsset = assetFromStringEx('THOR.RUNE') as Asset
export const DashAsset = assetFromStringEx('DASH.DASH') as Asset
export const KujiraAsset = assetFromStringEx('KUJI.KUJI') as Asset
export const ArbAsset = assetFromStringEx('ARB.ETH') as Asset
export const XdrAsset = assetFromStringEx('XRD.XRD') as Asset
export const ZecAsset = assetFromStringEx('ZEC.ZEC') as Asset

export const BtcChain = 'BTC'
export const EthChain = 'ETH'
export const MayaChain = 'MAYA'
export const ThorChain = 'THOR'
export const DashChain = 'DASH'
export const KujiraChain = 'KUJI'
export const ArbChain = 'ARB'
export const XdrChain = 'XRD'
export const ZecChain = 'ZEC'

export const DEFAULT_MAYACHAIN_DECIMALS = 8
