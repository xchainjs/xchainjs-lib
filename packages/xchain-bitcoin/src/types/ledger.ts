import { Address, Network, TxParams } from '@xchainjs/xchain-client/lib'
import { UTXOs } from '../utils'
import { FeeRate } from './client-types'

export type LedgerTxInfo = {
  utxos: UTXOs
  newTxHex: string
}

export type LedgerTxInfoParams = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
  network: Network
  nodeUrl: string
  nodeApiKey: string
}
