import { ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'

import { UtxoOnlineDataProviders } from './provider-types'

export type UtxoClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  dataProviders: UtxoOnlineDataProviders[]
}

export type Witness = {
  value: number
  script: Buffer
}

export type UTXO = {
  hash: string
  index: number
  value: number
  witnessUtxo?: Witness
  txHex?: string
  scriptPubKey?: string
}
