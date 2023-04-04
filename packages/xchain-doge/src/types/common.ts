import { Network } from '@xchainjs/xchain-client'

export type BroadcastTxParams = {
  network: Network
  txHex: string
  nodeUrl: string
}
