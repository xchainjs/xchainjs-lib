import { Balance as BaseBalance, ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'
import { Asset, TokenAsset } from '@xchainjs/xchain-util'
/**
 * Solana client params
 */
export type SOLClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}

export type Balance = BaseBalance & {
  asset: Asset | TokenAsset
}
