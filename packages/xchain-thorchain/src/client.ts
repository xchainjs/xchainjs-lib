import { AssetInfo } from '@xchainjs/xchain-client'
import { Client as CosmosSDKClient, CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, assetFromString, assetToString, isSynthAsset } from '@xchainjs/xchain-util'

import { AssetRUNE, RUNE_DECIMAL, RUNE_DENOM, defaultClientConfig } from './const'
import { getDefaultExplorers, getExplorerAddressUrl, getExplorerTxUrl, isAssetRune } from './utils'

/**
 * Interface for custom Thorchain client
 */
export type ThorchainClientParams = Partial<CosmosSdkClientParams>

export class Client extends CosmosSDKClient {
  constructor(config: ThorchainClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  /**
   * Get client native asset
   * @returns {asset} Thorchain native asset
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetRUNE,
      decimal: RUNE_DECIMAL,
    }
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for thorchain based on the current network.
   */
  public getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  /**
   * Get Asset from denomination
   *
   * @param {string} denom
   * @returns {Asset|null} The asset of the given denomination.
   */
  public assetFromDenom(denom: string): Asset | null {
    if (denom === RUNE_DENOM) return AssetRUNE
    return assetFromString(denom.toUpperCase())
  }

  /**
   * Get denomination from Asset
   *
   * @param {Asset} asset
   * @returns {string} The denomination of the given asset.
   */
  public getDenom(asset: Asset): string | null {
    if (isAssetRune(asset)) return RUNE_DENOM
    if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
    return asset.symbol.toLowerCase()
  }
}
