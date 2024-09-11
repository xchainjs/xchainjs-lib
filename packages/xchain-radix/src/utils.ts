import { address, bucket, str } from '@radixdlt/radix-engine-toolkit'
import { Address, Asset, TokenAsset, eqAsset } from '@xchainjs/xchain-util'

import { AssetXRD, RADIX_ASSET_RESOURCE } from './const'

/**
 * Returns the resource id of an asset
 * @param {Asset | TokenAsset} asset asset
 * @returns Resource id
 */
export const getAssetResource = (asset: Asset | TokenAsset): string => {
  if (eqAsset(asset, AssetXRD)) return RADIX_ASSET_RESOURCE
  return asset.symbol.slice(asset.ticker.length + 1)
}

/**
 * Generates a address param for a call method
 * @param {Address} addr Address to transform to Radix Address parameter
 * @returns the address in the Radix Address parameter format
 */
export const generateAddressParam = (addr: Address) => address(addr)

/**
 * Generates a string param for a call method
 * @param {string} s Address to transform to Radix string parameter
 * @returns the string in the Radix String parameter format
 */
export const generateStringParam = (s: string) => str(s)

/**
 * Generates a bucket param for a call method
 * @param {number} value Value to transform to Radix Bucket parameter
 * @returns the value in the Radix Bucket parameter format
 */
export const generateBucketParam = (value: number) => bucket(value)
