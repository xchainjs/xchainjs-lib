import { ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'

/**
 * Solana client params
 */
export type SOLClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}
