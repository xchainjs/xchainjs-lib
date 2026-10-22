import { NetworkId, address, bucket, str } from '@radixdlt/radix-engine-toolkit'
import { Address, Asset, TokenAsset, eqAsset } from '@xchainjs/xchain-util'

import { AssetXRD, RADIX_ASSET_RESOURCE, STOKENET_XRD_RESOURCE } from './const'

// Callers that omit the network keep the mainnet resource.
export const getXrdResource = (networkId: number = NetworkId.Mainnet): string => {
  if (networkId === NetworkId.Stokenet) return STOKENET_XRD_RESOURCE
  return RADIX_ASSET_RESOURCE
}

export const getAssetResource = (asset: Asset | TokenAsset, networkId: number = NetworkId.Mainnet): string => {
  if (eqAsset(asset, AssetXRD)) return getXrdResource(networkId)
  return asset.symbol.slice(asset.ticker.length + 1)
}

export const generateAddressParam = (addr: Address) => address(addr)

export const generateStringParam = (s: string) => str(s)

export const generateBucketParam = (value: number) => bucket(value)
