import { FeeRate, Network, TxParams, UTXO } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

export type LedgerTxInfo = {
  utxos: UTXO[]
  newTxHex: string
}

export type LedgerTxInfoParams = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
  network: Network
  apiKey: string
  sochainUrl: string
  nodeApiKey: string
}
