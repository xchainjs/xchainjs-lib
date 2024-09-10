import { Asset, TokenAsset, eqAsset } from '@xchainjs/xchain-util'

import { RADIX_ASSET_RESOURCE, XrdAssetMainnet, XrdAssetStokenet } from './const'

export const getAssetResource = (asset: Asset | TokenAsset): string => {
  if (eqAsset(asset, XrdAssetMainnet) || eqAsset(asset, XrdAssetStokenet)) return RADIX_ASSET_RESOURCE
  return asset.symbol.slice(asset.ticker.length + 1)
}
