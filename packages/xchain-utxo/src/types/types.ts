import {
  ExplorerProviders,
  Network,
  PreparedTx as BasePreparedTx,
  TxParams as BaseTxParams,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import {
  Balance,
  Tx,
  TxFrom,
  TxTo,
  TxsPage,
  UTXO,
  UtxoOnlineDataProvider,
  Witness,
} from '@xchainjs/xchain-utxo-providers'

export type UtxoClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  dataProviders: UtxoOnlineDataProviders[]
}

export type PreparedTx = BasePreparedTx & {
  utxos: UTXO[]
  inputs: UTXO[]
}

export type TxParams = BaseTxParams & {
  asset?: Asset
}

export type UtxoOnlineDataProviders = Record<Network, UtxoOnlineDataProvider | undefined>

export { UTXO, Witness, Balance, Tx, TxsPage, TxFrom, TxTo }
