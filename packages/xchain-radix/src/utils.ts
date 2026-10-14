import { address, bucket, str } from '@radixdlt/radix-engine-toolkit'
import { Address, Asset, TokenAsset, eqAsset } from '@xchainjs/xchain-util'

import { AssetXRD, RADIX_ASSET_RESOURCE } from './const'

export const getAssetResource = (asset: Asset | TokenAsset): string => {
  if (eqAsset(asset, AssetXRD)) return RADIX_ASSET_RESOURCE
  return asset.symbol.slice(asset.ticker.length + 1)
}

export const generateAddressParam = (addr: Address) => address(addr)

export const generateStringParam = (s: string) => str(s)

export const generateBucketParam = (value: number) => bucket(value)
