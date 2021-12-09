import { XChainClientParams } from '@xchainjs/xchain-client'

export type ZcashClientParams = XChainClientParams & {
  nodeUrl?: string
  sochainUrl?: string
}
