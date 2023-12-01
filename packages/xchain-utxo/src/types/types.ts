import { ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'
import { UTXO, UtxoOnlineDataProviders, Witness } from '@xchainjs/xchain-utxo-providers'

export type UtxoClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  dataProviders: UtxoOnlineDataProviders[]
}

export { UTXO, Witness }
