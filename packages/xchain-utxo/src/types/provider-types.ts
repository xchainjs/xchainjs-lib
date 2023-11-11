import { Network, OnlineDataProvider, TxHash } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

import { UTXO } from './types'

export interface UtxoOnlineDataProvider extends OnlineDataProvider {
  getConfirmedUnspentTxs(address: Address): Promise<UTXO[]>
  getUnspentTxs(address: Address): Promise<UTXO[]>
  broadcastTx(txHex: string): Promise<TxHash>
}

export type UtxoOnlineDataProviders = Record<Network, UtxoOnlineDataProvider | undefined>
