import { ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'
import { Asset, TokenAsset } from '@xchainjs/xchain-util'

/**
 * Cardano client params
 */
export type ADAClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}

export type CompatibleAsset = Asset | TokenAsset
