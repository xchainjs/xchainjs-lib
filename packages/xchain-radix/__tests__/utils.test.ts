import { NetworkId } from '@radixdlt/radix-engine-toolkit'

import {
  AssetXRD,
  RADIX_ASSET_RESOURCE,
  STOKENET_XRD_RESOURCE,
  feesEstimationPublicKeys,
  getAssetResource,
} from '../src'

describe('XRD resource by network', () => {
  it('uses the mainnet XRD resource when the network is omitted', () => {
    expect(getAssetResource(AssetXRD)).toBe(RADIX_ASSET_RESOURCE)
    expect(getAssetResource(AssetXRD, NetworkId.Mainnet)).toBe(RADIX_ASSET_RESOURCE)
    expect(feesEstimationPublicKeys[NetworkId.Mainnet].resourceAddress).toBe(RADIX_ASSET_RESOURCE)
  })

  it('uses the stokenet XRD resource on stokenet', () => {
    expect(getAssetResource(AssetXRD, NetworkId.Stokenet)).toBe(STOKENET_XRD_RESOURCE)
    expect(feesEstimationPublicKeys[NetworkId.Stokenet].resourceAddress).toBe(STOKENET_XRD_RESOURCE)
    expect(STOKENET_XRD_RESOURCE).not.toBe(RADIX_ASSET_RESOURCE)
  })
})
