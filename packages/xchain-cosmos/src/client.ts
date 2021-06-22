import { ClientParams as BaseClientParams, MultiAssetClient, BoundClientFactory } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import { CosmosSDKClient } from './cosmos'

import { Delegate } from './delegate'
import { AssetAtom, AssetMuon } from './types'

export interface ClientParams extends BaseClientParams {
  mainAsset: Asset
  sdkServer: string
  sdkChainId: string
}

// eslint-disable-next-line prefer-const
let boundClientFactory: BoundClientFactory<Client>

export class Client extends MultiAssetClient<typeof Delegate.create> {
  static create(...args: Parameters<typeof boundClientFactory>): ReturnType<typeof boundClientFactory> {
    return boundClientFactory(...args)
  }

  getSDKClient(): Promise<CosmosSDKClient> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getSDKClient', ...[Array.from(arguments).slice(0)])
  }
}

const mainnetDefaultParams: ClientParams = {
  getFullDerivationPath: (index: number) => `44'/118'/0'/0/${index}`,
  explorer: {
    url: 'https://cosmos.bigdipper.live',
    getAddressUrl(address: string) {
      return `${this.url}/account/${address}`
    },
    getTxUrl(txid: string) {
      return `${this.url}/transactions/${txid}`
    },
  },
  mainAsset: AssetAtom,
  sdkServer: 'https://api.cosmos.network',
  sdkChainId: 'cosmoshub-3',
}

const testnetDefaultParams: ClientParams = {
  ...mainnetDefaultParams,
  getFullDerivationPath: (index: number) => `44'/118'/1'/0/${index}`,
  explorer: {
    ...mainnetDefaultParams.explorer,
    url: 'https://gaia.bigdipper.live',
  },
  mainAsset: AssetMuon,
  sdkServer: 'http://lcd.gaia.bigdipper.live:1317',
  sdkChainId: 'gaia-3a',
}

boundClientFactory = Client.bindDelegateFactory(Delegate.create, {
  mainnet: mainnetDefaultParams,
  testnet: testnetDefaultParams,
})
