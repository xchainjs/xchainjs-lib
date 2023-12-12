import { Network, OnlineDataProvider, TxHash } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

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

export interface UtxoOnlineDataProvider extends OnlineDataProvider {
  getConfirmedUnspentTxs(address: Address): Promise<UTXO[]>
  getUnspentTxs(address: Address): Promise<UTXO[]>
  broadcastTx(txHex: string): Promise<TxHash>
}

export type UtxoOnlineDataProviders = Record<Network, UtxoOnlineDataProvider | undefined>
