import { ExplorerProviders, PreparedTx as BasePreparedTx, XChainClientParams } from '@xchainjs/xchain-client'
import { UTXO, UtxoOnlineDataProviders } from '@xchainjs/xchain-utxo-providers'

export type UtxoClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  dataProviders: UtxoOnlineDataProviders[]
}

export type PreparedTx = BasePreparedTx & {
  utxos: UTXO[]
}
