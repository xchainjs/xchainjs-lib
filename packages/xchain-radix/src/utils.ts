import { Asset, TokenAsset } from '@xchainjs/xchain-util'

export const getAssetResource = (asset: Asset | TokenAsset): string => {
  return asset.symbol.slice(asset.ticker.length + 1)
}
