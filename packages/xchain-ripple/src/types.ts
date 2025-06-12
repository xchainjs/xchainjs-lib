import { ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'

export type XRPClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}

export type SignedTransaction = {
  tx_blob: string
  hash?: string
}
