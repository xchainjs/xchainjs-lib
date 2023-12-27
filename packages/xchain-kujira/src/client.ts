import { AssetInfo } from '@xchainjs/xchain-client'
import { Client as CosmosSdkClient, CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, eqAsset } from '@xchainjs/xchain-util'

import { AssetKUJI, KUJI_DECIMAL } from './const'
import { defaultClientConfig, getDefaultExplorers } from './utils'

export type KujiraClientParams = Partial<CosmosSdkClientParams>

export class Client extends CosmosSdkClient {
  constructor(config: KujiraClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetKUJI,
      decimal: KUJI_DECIMAL,
    }
    return assetInfo
  }

  getDenom(asset: Asset): string | null {
    if (eqAsset(asset, AssetKUJI)) return this.baseDenom
    return null
  }

  assetFromDenom(denom: string): Asset | null {
    if (denom === this.baseDenom) return AssetKUJI
    return {
      chain: AssetKUJI.chain,
      symbol: denom,
      ticker: '',
      synth: false,
    }
  }

  getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }
}
